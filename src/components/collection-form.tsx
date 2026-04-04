import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, TextInput } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import api from '../services/api';
import SuccessModal from './success-modal';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';


type CollectionFormProps = {
    mode: 'create' | 'edit';
    initialData?: any;
};

export default function CollectionForm({ mode, initialData }: CollectionFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [capital, setCapital] = useState(
        initialData?.capital != null ? formatCurrency(String(initialData.capital)) : ''
    );

    const [date, setDate] = useState<Date>(initialData?.release_date ? new Date(initialData.release_date) : new Date());
    const [paymentCutOff, setPaymentCutOff] = useState<Date>(initialData?.payment_cutoff_date ? new Date(initialData.payment_cutoff_date) : new Date());

    const [showReleasePicker, setShowReleasePicker] = useState(false);
    const [showCutOffPicker, setShowCutOffPicker] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ name: '', capital: '', date: '', paymentCutOff: '' });
    const [visible, setVisible] = useState(false);

    function formatCurrency(val: string) {
        const digits = val.replace(/\D/g, '');
        if (!digits) return '';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(parseInt(digits));
    }

    // Format Date object to YYYY-MM-DD string for PHP backend
    const formatDateString = (dateObj: Date) => {
        return dateObj.toISOString().split('T')[0];
    };

    const handleSubmit = async () => {
        const newErrors = { name: '', capital: '', date: '', paymentCutOff: '' };
        let isValid = true;

        if (!name.trim()) {
            newErrors.name = 'Collection number is required.';
            isValid = false;
        }

        const rawCapital = capital.replace(/\D/g, '');
        if (!rawCapital || rawCapital === '0') {
            newErrors.capital = 'Capital is required.';
            isValid = false;
        }

        if (!date) {
            newErrors.date = 'Release date is required.';
            isValid = false;
        }

        if (paymentCutOff < date) {
            newErrors.paymentCutOff = 'Cut-off date cannot be before release date.';
            isValid = false;
        }


        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: name.replace(/\D/g, ''),
                release_date: formatDateString(date),
                payment_cutoff_date: formatDateString(paymentCutOff),
                capital: capital.replace(/\D/g, '') || 0,
            };

            if (mode === 'create') {
                await api.post('/collections', payload);
            } else {
                await api.put(`/collections/${initialData.id}`, payload);
            }

            setVisible(true);
            setTimeout(() => {
                setVisible(false);
                router.replace('/(tabs)/inventory');
            }, 1500);
        } catch (error: any) {
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors || {};
                setErrors({
                    name: validationErrors.name ? validationErrors.name[0] : '',
                    capital: validationErrors.capital ? validationErrors.capital[0] : '',
                    date: validationErrors.release_date ? validationErrors.release_date[0] : '',
                    paymentCutOff: validationErrors.payment_cutoff_date ? validationErrors.payment_cutoff_date[0] : '',

                });
            }
        } finally {
            setLoading(false);
        }
    };

    const InputLabel = ({ title }: { title: string }) => (
        <Text style={styles.label}>
            {title} <Text style={{ color: '#E70B0B' }}>*</Text>
        </Text>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>


                {/* Collection Number */}
                <View style={styles.inputGroup}>
                    <InputLabel title="Collection Number" />
                    <TextInput
                        value={name}
                        placeholder="12"
                        mode="flat"
                        keyboardType="numeric"
                        onChangeText={(val) => {
                            setName(val.replace(/\D/g, ''));
                            setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        error={!!errors.name}
                        style={styles.input}
                        underlineColor="#818181"
                        activeUnderlineColor="#0A0B32"
                        textColor="#0D0F66"
                        theme={{
                            colors: {
                                onSurfaceVariant: '#818181',
                                error: ERROR_COLOR
                            }
                        }}
                    />

                    <HelperText type="error" visible={!!errors.name} style={styles.helper}>
                        {errors.name}
                    </HelperText>
                </View>

                {/* Capital */}
                <View style={styles.inputGroup}>
                    <InputLabel title="Capital" />
                    <TextInput
                        value={capital}
                        placeholder="₱ 0"
                        mode="flat"
                        keyboardType="numeric"
                        onChangeText={(val) => {
                            setCapital(formatCurrency(val));
                            setErrors((prev) => ({ ...prev, capital: '' }));
                        }}
                        error={!!errors.capital}
                        style={styles.input}
                        underlineColor="#818181"
                        activeUnderlineColor="#0A0B32"
                        textColor="#0A0B32"
                        theme={{
                            colors: {
                                onSurfaceVariant: '#818181',
                                error: ERROR_COLOR
                            }
                        }}
                    />
                    <HelperText type="error" visible={!!errors.capital} style={styles.helper}>
                        {errors.capital}
                    </HelperText>

                </View>

                {/* Release Date Picker */}
                <View style={styles.inputGroup}>
                    <InputLabel title="Release Date" />
                    <TouchableOpacity onPress={() => setShowReleasePicker(true)}>
                        <View pointerEvents="none">
                            <TextInput
                                value={formatDateString(date)}
                                mode="flat"
                                style={styles.input}
                                underlineColor="#818181"
                                activeUnderlineColor="#0A0B32"
                                textColor="#0A0B32"
                                right={<TextInput.Icon icon="calendar" />}
                                editable={false}
                            />
                        </View>
                    </TouchableOpacity>

                    <HelperText type="error" visible={!!errors.date} style={styles.helper}>
                        {errors.date}
                    </HelperText>

                </View>

                {/* Payment Cut-off Picker */}
                <View style={styles.inputGroup}>
                    <InputLabel title="Payment Cut-off Date" />
                    <TouchableOpacity onPress={() => setShowCutOffPicker(true)}>
                        <View pointerEvents="none">
                            <TextInput
                                value={formatDateString(paymentCutOff)}
                                mode="flat"
                                style={styles.input}
                                underlineColor="#818181"
                                activeUnderlineColor="#0A0B32"
                                textColor="#0A0B32"
                                right={<TextInput.Icon icon="calendar" />}
                                editable={false}
                            />
                        </View>
                    </TouchableOpacity>

                    <HelperText type="error" visible={!!errors.paymentCutOff} style={styles.helper}>
                        {errors.paymentCutOff}
                    </HelperText>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    disabled={loading}
                    style={styles.saveButton}
                    labelStyle={styles.buttonLabel}
                    contentStyle={styles.buttonContent}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        mode === 'create' ? 'Save' : 'Update'
                    )}
                </Button>


                {/* MD3 Date Picker Modals */}
                <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={showReleasePicker}
                    onDismiss={() => setShowReleasePicker(false)}
                    date={date}
                    onConfirm={(params) => {
                        setShowReleasePicker(false);
                        if (params.date) setDate(params.date);
                    }}
                />

                <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={showCutOffPicker}
                    onDismiss={() => setShowCutOffPicker(false)}
                    date={paymentCutOff}
                    onConfirm={(params) => {
                        setShowCutOffPicker(false);
                        if (params.date) setPaymentCutOff(params.date);
                    }}
                />

            </ScrollView>


            <SuccessModal
                visible={visible}
                message={mode === 'create' ? 'A new collection was made successfully!' : 'Collection was updated successfully!'}
            />

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 40
    },
    inputGroup: {
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        color: '#3E4491',
        fontWeight: '500',
        marginBottom: -5,
    },
    input: {
        backgroundColor: 'transparent',
        height: 50,
        paddingHorizontal: 0,
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: '#0A256C',
        borderRadius: 8,
        elevation: 0,
    },
    buttonContent: {
        height: 55
    },
    buttonLabel: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'none',
    },
    helper: {
        paddingHorizontal: 0,
        lineHeight: 14,
        color: '#9E2626',
    },
});
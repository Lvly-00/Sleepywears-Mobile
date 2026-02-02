import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, TouchableRipple } from 'react-native-paper';

// Sample data for the placeholder
const MOCK_CUSTOMERS = [
    { id: 1, name: 'Naruto Uzumaki', email: 'naruto@leafvillage.jp', initials: 'NU' },
    { id: 2, name: 'Sasuke Uchiha', email: 'sasuke@uchiha.jp', initials: 'SU' },
    { id: 3, name: 'Sakura Haruno', email: 'sakura@leafvillage.jp', initials: 'SH' },
    { id: 4, name: 'Monkey D. Luffy', email: 'luffy@strawhat.pirate', initials: 'ML' },
    { id: 5, name: 'Roronoa Zoro', email: 'zoro@strawhat.pirate', initials: 'RZ' },
    { id: 6, name: 'Nami', email: 'nami@strawhat.pirate', initials: 'N' },
    { id: 7, name: 'Ichigo Kurosaki', email: 'ichigo@karakura.jp', initials: 'IK' },
    { id: 8, name: 'Rukia Kuchiki', email: 'rukia@soulreapers.jp', initials: 'RK' },
    { id: 9, name: 'Light Yagami', email: 'light@kira.jp', initials: 'LY' },
    { id: 10, name: 'L Lawliet', email: 'l@detective.org', initials: 'L' },
    { id: 11, name: 'Eren Yeager', email: 'eren@paradis.island', initials: 'EY' },
    { id: 12, name: 'Mikasa Ackerman', email: 'mikasa@paradis.island', initials: 'MA' },
    { id: 13, name: 'Levi Ackerman', email: 'levi@scouts.org', initials: 'LA' },
    { id: 14, name: 'Goku Son', email: 'goku@saiyan.space', initials: 'GS' },
    { id: 15, name: 'Vegeta', email: 'vegeta@saiyan.space', initials: 'V' },
    { id: 16, name: 'Tanjiro Kamado', email: 'tanjiro@demonslayer.jp', initials: 'TK' },
    { id: 17, name: 'Nezuko Kamado', email: 'nezuko@demonslayer.jp', initials: 'NK' },
    { id: 18, name: 'Gojo Satoru', email: 'gojo@jujutsu.tech', initials: 'GS' },
    { id: 19, name: 'Yuji Itadori', email: 'yuji@jujutsu.tech', initials: 'YI' },
    { id: 20, name: 'Edward Elric', email: 'edward@alchemy.org', initials: 'EE' },
];


export default function CustomersScreen() {

    const handleAddCustomer = () => {
        console.log('Add Customer Pressed');
        // router.push('/create-customer');
    };

    return (

        <ScrollView style={styles.container}>

            {MOCK_CUSTOMERS.map((customer) => (
                <TouchableRipple
                    key={customer.id}
                    onPress={() => console.log('Customer pressed')}
                    rippleColor="rgba(10, 11, 50, .1)"
                    style={styles.customerCard}
                >
                    <View style={styles.cardContent}>
                        {/* AVATAR TEXT COMPONENT */}
                        <Avatar.Text
                            size={48}
                            label={customer.initials}
                            style={styles.avatar}
                            labelStyle={styles.avatarLabel}
                        />

                        <View style={styles.infoContainer}>
                            <Text style={styles.customerName}>{customer.name}</Text>
                            <Text style={styles.customerEmail}>{customer.email}</Text>
                        </View>
                    </View>
                </TouchableRipple>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    heading: {
        fontSize: 28,
        fontFamily: 'LeagueSpartan-Bold',
        marginBottom: 20,
        color: '#0A0B32',
    },
    customerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    avatar: {
        backgroundColor: '#AB8262', // Using your Tan brand color
    },
    avatarLabel: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 20,
        color: '#fff',
    },
    infoContainer: {
        marginLeft: 15,
    },
    customerName: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 18,
        color: '#0A0B32',
    },
    customerEmail: {
        fontFamily: 'LeagueSpartan',
        fontSize: 14,
        color: '#666',
    },
});
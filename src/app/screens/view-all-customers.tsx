import api from '@/src/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, Searchbar } from 'react-native-paper';
import CustomerSkeleton from '../../components/customer-skeleton-loader';


// Define the shape of your customer based on your Laravel controller
interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    address: string;
    contact_number: string;
    social_handle: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

export default function ViewAllCustomersScreen() {
    const router = useRouter();
    const params = useLocalSearchParams(); // Access the cart items passed from ConfirmOrderScreen

    const [searchQuery, setSearchQuery] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]); // Typed as Customer array
    const [loading, setLoading] = useState(true);

    // Fetch data from Laravel Backend
    const fetchCustomers = async (search = '') => {
        try {
            setLoading(true);
            // Matches your controller: apiResource('customers') -> GET /customers
            const res = await api.get("/customers", {
                params: { search, per_page: 100 }
            });

            // Laravel cursorPaginate returns items in data.data
            setCustomers(res.data.data || []);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(searchQuery);
    }, [searchQuery]);

    // Transform flat array into Alphabetical Sections
    const sections = useMemo(() => {
        const groups = customers.reduce((acc: { [key: string]: Customer[] }, customer) => {
            const firstLetter = customer.first_name?.[0]?.toUpperCase() || '#';
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(customer);
            return acc;
        }, {});

        return Object.keys(groups)
            .sort()
            .map(letter => ({
                title: letter,
                data: groups[letter].sort((a, b) =>
                    (a.first_name || "").localeCompare(b.first_name || "")
                )
            }));
    }, [customers]);

    const handleSelect = (customer: Customer) => {
        // IMPORTANT: We pass 'items' back as well so the Order Summary doesn't disappear
        router.replace({
            pathname: '/screens/confirm-order',
            params: {
                selectedCustomer: JSON.stringify(customer),
                items: params.items // Carry the cart items back
            }
        });
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery
                    ? `We couldn't find any results for "${searchQuery}"`
                    : "Your customer list is currently empty."}
            </Text>
        </View>
    );


    return (
        <View style={styles.container}>
            <View style={styles.headerPadding}>
                <Searchbar
                    placeholder="Search Customer..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor="#999"
                    elevation={0}
                />
            </View>

            <View style={styles.listContainer}>
                {loading && customers.length === 0 ? (
                    <CustomerSkeleton repeatSections={4} itemsPerSection={5} />
                ) : (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
                                <Text style={styles.itemText}>{item.first_name} {item.last_name}</Text>
                            </TouchableOpacity>
                        )}
                        renderSectionHeader={({ section: { title } }) => (
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>{title}</Text>
                                <Divider style={styles.divider} />
                            </View>
                        )}
                        stickySectionHeadersEnabled={false}
                        contentContainerStyle={customers.length === 0 ? { flex: 1 } : { paddingBottom: 40 }}
                        // THIS HANDLES THE EMPTY STATE
                        ListEmptyComponent={renderEmptyState}
                    />
                )}

                {/* Vertical Alphabet Sidebar - Only show if there are customers */}
                {customers.length > 0 && (
                    <View style={styles.alphabetSidebar}>
                        {ALPHABET.map(char => (
                            <Text key={char} style={styles.alphabetChar}>{char}</Text>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    headerPadding: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
    },

    searchBar: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 45,
        borderRadius: 10,
    },

    searchInput: {
        fontSize: 14,
        minHeight: 0,
    },

    listContainer: {
        flex: 1,
        flexDirection: 'row',
    },

    sectionHeader: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        marginTop: 15,
    },

    sectionHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#AAA',
        marginBottom: 5,
    },

    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },

    item: {
        paddingVertical: 15,
        paddingHorizontal: 20,
    },

    itemText: {
        fontSize: 16,
        color: '#333',
    },

    alphabetSidebar: {
        width: 25,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 10,
    },

    alphabetChar: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0D0F66',
        marginVertical: 1,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: -70,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
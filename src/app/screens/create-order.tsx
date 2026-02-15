import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function CreateOrderScreen() {

    const placeOrder = () => {
        console.log('Order Placed');
        router.push('/screens/confirm-order');
    };

    return (
        <View style={styles.container}>
            {/* Main content of your screen goes here */}
            <View style={styles.content}>
                <Text style={styles.title}>Create New Order</Text>
                <Text style={styles.subtitle}>Fill in the details below to proceed.</Text>
            </View>

            {/* Floating button on the lower right */}
            <Button 
                mode="contained" 
                onPress={placeOrder}
                style={styles.placeOrderButton}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
            >
                Place Order
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F0ED', 
    },
    content: {
        padding: 20,
        marginTop: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: 'LeagueSpartan-Bold',
        color: '#0A0B32',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
        color: '#666',
        marginTop: 5,
    },
    placeOrderButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#AB8262', 
        borderRadius: 12,
        elevation: 4, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonContent: {
        paddingHorizontal: 10,
        height: 50,
    },
    buttonLabel: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 18,
        color: '#FFFFFF',
    },
});
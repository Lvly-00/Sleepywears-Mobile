// import React from 'react';
// import {
//     Dimensions,
//     SectionList,
//     StyleSheet,
//     Text,
//     View,
// } from 'react-native';

// const { width } = Dimensions.get('window');

// // 1. DUMMY DATA
// const NOTIFICATIONS = [
//     {
//         title: 'NOW',
//         data: [
//             {
//                 id: '1',
//                 iconText: '18',
//                 title: 'Payment Cut-Off',
//                 description: 'Collection 18 is due today',
//                 time: '1:17pm',
//             },
//             {
//                 id: '2',
//                 iconText: 'AN',
//                 title: 'Upcoming Payment Due',
//                 description: 'Amy Naranja’s payment is due today',
//                 time: '1:17pm',
//             },
//         ],
//     },
//     {
//         title: 'EARLIER TODAY',
//         data: [
//             {
//                 id: '3',
//                 iconText: '19',
//                 title: 'Upcoming Payment Due',
//                 description: 'Collection 19 is due in 4 days',
//                 time: '12:01pm',
//             },
//         ],
//     },
//     {
//         title: 'YESTERDAY',
//         data: [
//             {
//                 id: '4',
//                 iconText: '19',
//                 title: 'Upcoming Payment Due',
//                 description: 'Collection 19 is due in 5 days',
//                 time: '1:17pm',
//             },
//         ],
//     },
// ];

// export default function NotificationScreen() {

//     const renderItem = ({ item }: { item: any }) => (
//         <View style={styles.notificationItem}>
//             {/* Icon/Avatar */}
//             <View style={styles.iconContainer}>
//                 <Text style={styles.iconText}>{item.iconText}</Text>
//             </View>

//             {/* Content */}
//             <View style={styles.contentContainer}>
//                 <Text style={styles.notifTitle}>{item.title}</Text>
//                 <Text style={styles.notifDescription}>{item.description}</Text>
//             </View>

//             {/* Timestamp */}
//             <Text style={styles.timeText}>{item.time}</Text>
//         </View>
//     );

//     const renderSectionHeader = ({ section: { title } }: any) => (
//         <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>{title}</Text>
//         </View>
//     );

//     return (
//         <View style={styles.container}>
//             <SectionList
//                 sections={NOTIFICATIONS}
//                 keyExtractor={(item) => item.id}
//                 renderItem={renderItem}
//                 renderSectionHeader={renderSectionHeader}
//                 stickySectionHeadersEnabled={false}
//                 contentContainerStyle={styles.listContent}
//                 ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
//                 SectionSeparatorComponent={() => <View style={styles.divider} />}
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FFFFFF',
//     },
//     listContent: {
//         paddingHorizontal: 25,
//         paddingBottom: 40,
//     },
//     sectionHeader: {
//         marginTop: 25,
//     },
//     sectionTitle: {
//         fontFamily: 'LeagueSpartan-Bold',
//         fontSize: 14,
//         color: '#8E94C1',
//         letterSpacing: 0.5,
//     },
//     notificationItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     iconContainer: {
//         width: 45,
//         height: 45,
//         backgroundColor: '#0A0B32',
//         borderRadius: 8,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     iconText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontFamily: 'LeagueSpartan-Bold',
//     },
//     contentContainer: {
//         flex: 1,
//         marginLeft: 15,
//         justifyContent: 'center',
//     },
//     notifTitle: {
//         fontFamily: 'LeagueSpartan-Bold',
//         fontSize: 18,
//         color: '#000000',
//         marginBottom: 2,
//     },
//     notifDescription: {
//         fontFamily: 'LeagueSpartan',
//         fontSize: 14,
//         color: '#333333',
//     },
//     timeText: {
//         fontFamily: 'LeagueSpartan',
//         fontSize: 13,
//         color: '#000000',
//         alignSelf: 'flex-start',
//         marginTop: 5,
//     },
//     divider: {
//         height: 1,
//         backgroundColor: '#E5E5E5',
//         marginVertical: 10,},
// });
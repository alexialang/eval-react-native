import React from 'react';
import { Alert, FlatList, Linking, StyleSheet, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Contact {
  id: string;
  name: string;
  phone: string;
  role: string;
}

const CONTACTS: Contact[] = [
  {
    id: '1',
    name: '📞 Centrale Dispatch',
    phone: '+33 1 23 45 67 89',
    role: '📡 Coordination transport'
  },
  {
    id: '2',
    name: '🔧 Urgences Techniques',
    phone: '+33 1 23 45 67 90',
    role: '⚙️ Assistance mécanique'
  },
  {
    id: '3',
    name: '🚔 Police Routière',
    phone: '+33 1 23 45 67 91',
    role: '🚨 Signalement obstacles'
  },
  {
    id: '4',
    name: '🚄 SNCF Trafic',
    phone: '+33 1 23 45 67 92',
    role: '🛤️ Passages à niveau'
  },
  {
    id: '5',
    name: '🛡️ Responsable Sécurité',
    phone: '+33 1 23 45 67 93',
    role: '📝 Protocoles sécurité'
  }
];

export default function ContactsScreen() {
  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      'Appel',
      `Voulez-vous appeler ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => Linking.openURL(`tel:${phone}`)
        }
      ]
    );
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <ThemedView style={styles.contactCard}>
      <ThemedView style={styles.contactInfo}>
        <ThemedText type="subtitle" style={styles.contactName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.contactRole}>
          {item.role}
        </ThemedText>
        <ThemedText style={styles.contactPhone}>
          {item.phone}
        </ThemedText>
      </ThemedView>
      <TouchableOpacity 
        style={styles.callButton} 
        onPress={() => handleCall(item.phone, item.name)}
      >
        <ThemedText style={styles.callEmoji}>📞</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FF6B9D', dark: '#1C1C1E' }}
      headerImage={
        <ThemedText style={styles.headerEmoji}>📞</ThemedText>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Contacts Utiles</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.description}>
        Vos contacts essentiels pour le transport
      </ThemedText>

      <FlatList
        data={CONTACTS}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
        scrollEnabled={false}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
    opacity: 0.8,
  },
  contactsList: {
    marginTop: 10,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  contactInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactRole: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#5B9BD5',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  headerEmoji: {
    fontSize: 120,
    position: 'absolute',
    bottom: 75,
    left: 20,
  },
  callEmoji: {
    fontSize: 28,
  },
});
// TeamPage.jsx - Version minimale garantie
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const TeamPage = () => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Chargement membres...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const membersList = [];
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          membersList.push({
            id: doc.id,
            email: data.email,
            displayName: data.displayName || data.email.split('@')[0],
            role: data.role || 'Membre'
          });
        }
      });
      
      setMembers(membersList);
      console.log(`✅ ${membersList.length} membres chargés`);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMembers();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Chargement équipe...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Users size={32} />
        Équipe ({members.length} membres)
      </h1>
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Erreur: {error}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginTop: '20px' }}>
        {members.map((member) => (
          <div key={member.id} style={{ 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            padding: '15px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>{member.displayName}</h3>
            <p>Email: {member.email}</p>
            <p>Rôle: {member.role}</p>
          </div>
        ))}
      </div>
      
      {members.length === 0 && !loading && (
        <p>Aucun membre trouvé dans la collection users.</p>
      )}
    </div>
  );
};

export default TeamPage;

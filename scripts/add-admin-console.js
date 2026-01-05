// ============================================
// ADMIN SETUP SCRIPT FOR VYBB LIVE
// ============================================
// Copy and paste this ENTIRE script into your browser console
// while on your website (after logging in)

console.log('🎯 VYBB LIVE - Admin Setup Script');
console.log('================================\n');

// Function to add admin using the site's Firebase instance
async function setupAdmin() {
  try {
    // Check if we can access the Firestore modules
    const { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } = 
      await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Try to get the db from the global scope
    let db;
    
    // Method 1: Check if db is exported globally
    if (window.db) {
      db = window.db;
      console.log('✅ Found Firestore instance');
    } else {
      console.error('❌ Could not find Firestore instance');
      console.log('📝 Please use the manual method below');
      return false;
    }
    
    // Get email input
    const email = prompt('Enter admin email address:');
    
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      return false;
    }
    
    console.log(`🔄 Processing admin: ${email}`);
    
    // Check if admin already exists
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      console.warn('⚠️ Admin already exists in database');
      const shouldUpdate = confirm('Admin exists. Update to approved status?');
      
      if (shouldUpdate) {
        const adminDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'admins', adminDoc.id), {
          approved: true,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Admin updated successfully!');
        console.log('🔄 Please refresh the page to see changes');
      }
      return true;
    }
    
    // Add new admin
    const adminData = {
      email: email,
      approved: true,
      role: 'admin',
      createdAt: serverTimestamp(),
      createdBy: 'console-script'
    };
    
    const docRef = await addDoc(adminsRef, adminData);
    
    console.log('✅ SUCCESS! Admin added to database');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🆔 Document ID:', docRef.id);
    console.log('🔐 Role: admin');
    console.log('✓ Status: approved');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Please REFRESH the page');
    console.log('🔗 Then navigate to /admin');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Run the setup
setupAdmin().then(success => {
  if (!success) {
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 MANUAL SETUP INSTRUCTIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Go to: https://console.firebase.google.com');
    console.log('2. Select your project');
    console.log('3. Click "Firestore Database" in the left sidebar');
    console.log('4. Click "Start Collection" (or add to existing)');
    console.log('5. Collection ID: admins');
    console.log('6. Click "Next" and "Add Document"');
    console.log('7. Add these fields:');
    console.log('');
    console.log('   Field Name    | Type      | Value');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   email         | string    | your-email@example.com');
    console.log('   approved      | boolean   | true');
    console.log('   role          | string    | admin');
    console.log('   createdAt     | timestamp | (current time)');
    console.log('');
    console.log('8. Click "Save"');
    console.log('9. Refresh your website');
    console.log('10. Navigate to /admin page');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
});


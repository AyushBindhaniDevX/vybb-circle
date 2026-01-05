// Script to add admin user to Firestore
// Run this in the browser console on your site

// Copy and paste this entire script into the browser console when logged into your site

(async function addAdmin() {
  try {
    // Import necessary Firebase functions
    // @ts-ignore - Dynamic CDN import
    const { collection, addDoc, query, where, getDocs, serverTimestamp } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );
    
    // Get the db instance from your app
    // @ts-ignore - db should be available in the global scope
    const db = window.db;
    
    if (!db) {
      console.error("❌ Firestore database not found. Make sure you're on the site.");
      return;
    }

    // Prompt for admin email
    const email = prompt("Enter admin email address:");
    
    if (!email || !email.includes('@')) {
      console.error("❌ Invalid email address");
      return;
    }

    // Check if admin already exists
    const adminsRef = collection(db, "admins");
    const q = query(adminsRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.warn("⚠️ Admin already exists:", email);
      
      // Ask if they want to update
      const update = confirm("Admin already exists. Update to approved?");
      if (!update) return;

      // Update existing admin
      const adminDoc = snapshot.docs[0];
      // @ts-ignore - Dynamic CDN import
      const { updateDoc, doc } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
      );
      await updateDoc(doc(db, "admins", adminDoc.id), {
        approved: true,
        updatedAt: serverTimestamp()
      });
      
      console.log("✅ Admin updated successfully:", email);
      return;
    }

    // Add new admin
    const adminData = {
      email: email,
      approved: true,
      role: "admin",
      createdAt: serverTimestamp(),
      createdBy: "console-script"
    };

    const docRef = await addDoc(adminsRef, adminData);
    
    console.log("✅ Admin added successfully!");
    console.log("📧 Email:", email);
    console.log("🆔 Document ID:", docRef.id);
    console.log("🔐 Access will be granted on next login");
    
  } catch (error) {
    console.error("❌ Error adding admin:", error);
    console.log("\n📝 Manual instructions:");
    console.log("1. Go to Firebase Console > Firestore Database");
    console.log("2. Create a new collection called 'admins'");
    console.log("3. Add a document with these fields:");
    console.log("   - email: (string) your-email@example.com");
    console.log("   - approved: (boolean) true");
    console.log("   - role: (string) admin");
    console.log("   - createdAt: (timestamp) current time");
  }
})();

import { useState, useEffect } from 'react'
import { auth, googleProvider, db } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    name: '',
    dupr: '',
    phone: '',
    email: '',
    playTimes: [],
    playLocations: ''
  })
  const [savedProfileId, setSavedProfileId] = useState(null)
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Check if user has a profile
        await checkUserProfile(user.uid)
      }
      setInitializing(false)
    })
    return unsubscribe
  }, [])

  // Check if viewing someone's profile from URL
  useEffect(() => {
    const path = window.location.pathname
    if (path.startsWith('/player/')) {
      const playerId = path.split('/player/')[1]
      loadPlayerProfile(playerId)
    }
  }, [])

  const checkUserProfile = async (userId) => {
    try {
      const docRef = doc(db, 'players', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const userData = docSnap.data()
        setProfile(userData)
        setSavedProfileId(userId)
        // Load user's connections
        const connectionsQuery = query(collection(db, 'connections'), where('userId', '==', userId))
        const connectionsSnap = await getDocs(connectionsQuery)
        const userConnections = connectionsSnap.docs.map(doc => doc.data())
        setConnections(userConnections)
      }
    } catch (error) {
      console.error('Error checking profile:', error)
    }
  }

  const loadPlayerProfile = async (playerId) => {
    try {
      const docRef = doc(db, 'players', playerId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const playerData = docSnap.data()
        setProfile(playerData)
        setCurrentPage('public-profile')
        setSavedProfileId(playerId)
      } else {
        alert('Player not found!')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      // Pre-fill email and name from Google
      setProfile(prev => ({
        ...prev,
        email: user.email,
        name: user.displayName || prev.name
      }))
    } catch (error) {
      console.error('Error signing in:', error)
      alert('Error signing in with Google')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setProfile({
        name: '',
        dupr: '',
        phone: '',
        email: '',
        playTimes: [],
        playLocations: ''
      })
      setSavedProfileId(null)
      setConnections([])
      setCurrentPage('home')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    },
    nav: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '10px',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    navButton: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px'
    },
    signOutButton: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px'
    },
    googleButton: {
      padding: '12px 24px',
      backgroundColor: '#4285f4',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '18px',
      width: '100%',
      marginTop: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    form: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    checkbox: {
      marginRight: '10px'
    },
    checkboxLabel: {
      marginRight: '20px'
    },
    button: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '18px',
      cursor: 'pointer',
      width: '100%',
      marginTop: '20px'
    },
    profileDisplay: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      lineHeight: '1.8'
    },
    urlBox: {
      backgroundColor: '#f3f4f6',
      padding: '15px',
      borderRadius: '6px',
      marginTop: '20px',
      wordBreak: 'break-all',
      border: '2px solid #3b82f6'
    },
    connectionCard: {
      backgroundColor: 'white',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      color: '#6b7280'
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePlayTimeChange = (time) => {
    setProfile(prev => ({
      ...prev,
      playTimes: prev.playTimes.includes(time)
        ? prev.playTimes.filter(t => t !== time)
        : [...prev.playTimes, time]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please sign in first!')
      return
    }
    
    setLoading(true)
    
    try {
      // Save to Firebase with user's ID as document ID
      await setDoc(doc(db, 'players', user.uid), {
        ...profile,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      })
      
      setSavedProfileId(user.uid)
      alert('Profile saved! Your NFC URL is ready.')
      setCurrentPage('view-profile')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!user) {
      alert('Please sign in to connect with players!')
      return
    }
    
    if (!savedProfileId || savedProfileId === user.uid) {
      return
    }
    
    try {
      // Save connection for current user
      await setDoc(doc(collection(db, 'connections')), {
        userId: user.uid,
        connectedToId: savedProfileId,
        connectedToName: profile.name,
        connectedToDupr: profile.dupr,
        connectedAt: new Date().toISOString()
      })
      
      alert(`Connected with ${profile.name}!`)
      // Redirect to connections page
      window.location.href = '/'
    } catch (error) {
      console.error('Error saving connection:', error)
    }
  }

  if (initializing) {
    return <div style={styles.container}>Loading...</div>
  }

  return (
    <div style={styles.container}>
      {currentPage !== 'public-profile' && (
        <nav style={styles.nav}>
          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            <button style={styles.navButton} onClick={() => setCurrentPage('home')}>
              Home
            </button>
            {user && (
              <>
                <button style={styles.navButton} onClick={() => setCurrentPage('profile')}>
                  {savedProfileId ? 'Edit Profile' : 'Create Profile'}
                </button>
                {savedProfileId && (
                  <button style={styles.navButton} onClick={() => setCurrentPage('view-profile')}>
                    My Profile
                  </button>
                )}
                <button style={styles.navButton} onClick={() => setCurrentPage('connections')}>
                  Connections
                </button>
              </>
            )}
          </div>
          {user && (
            <div style={styles.userInfo}>
              <span>{user.email}</span>
              <button style={styles.signOutButton} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </nav>
      )}

      {currentPage === 'home' && (
        <div>
          <h1>Welcome to Pickle Connect</h1>
          <p style={{fontSize: '18px', marginTop: '20px'}}>
            Share your pickleball player profile instantly with NFC tags!
          </p>
          {!user ? (
            <button style={styles.googleButton} onClick={handleGoogleSignIn}>
              Sign in with Google
            </button>
          ) : savedProfileId ? (
            <button 
              style={{...styles.button, marginTop: '30px'}}
              onClick={() => setCurrentPage('view-profile')}
            >
              View Your Profile
            </button>
          ) : (
            <button 
              style={{...styles.button, marginTop: '30px'}}
              onClick={() => setCurrentPage('profile')}
            >
              Create Your Profile
            </button>
          )}
        </div>
      )}

      {currentPage === 'profile' && user && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h2>{savedProfileId ? 'Edit Your Profile' : 'Create Your Player Profile'}</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>DUPR Rating</label>
            <input
              style={styles.input}
              type="number"
              step="0.1"
              min="2.0"
              max="5.0"
              name="dupr"
              value={profile.dupr}
              onChange={handleInputChange}
              placeholder="2.0 - 5.0"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone</label>
            <input
              style={styles.input}
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              required
              disabled
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>When do you like to play?</label>
            <div>
              <label style={styles.checkboxLabel}>
                <input
                  style={styles.checkbox}
                  type="checkbox"
                  checked={profile.playTimes.includes('morning')}
                  onChange={() => handlePlayTimeChange('morning')}
                />
                Morning
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  style={styles.checkbox}
                  type="checkbox"
                  checked={profile.playTimes.includes('noon')}
                  onChange={() => handlePlayTimeChange('noon')}
                />
                Noon
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  style={styles.checkbox}
                  type="checkbox"
                  checked={profile.playTimes.includes('night')}
                  onChange={() => handlePlayTimeChange('night')}
                />
                Night
              </label>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Where do you like to play?</label>
            <input
              style={styles.input}
              type="text"
              name="playLocations"
              value={profile.playLocations}
              onChange={handleInputChange}
              placeholder="e.g., Central Park Courts, Riverside Courts"
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Saving...' : savedProfileId ? 'Update Profile' : 'Save Profile'}
          </button>
        </form>
      )}

      {currentPage === 'view-profile' && savedProfileId && user && (
        <div style={styles.profileDisplay}>
          <h2>Your Profile</h2>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>DUPR Rating:</strong> {profile.dupr}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Play Times:</strong> {profile.playTimes.join(', ')}</p>
          <p><strong>Locations:</strong> {profile.playLocations}</p>
          
          <div style={styles.urlBox}>
            <strong>Your NFC URL:</strong><br/>
            {window.location.origin}/player/{user.uid}
          </div>
          
          <p style={{marginTop: '20px', fontSize: '14px', color: '#6b7280'}}>
            Write this URL to your NFC tag or paddle sticker!
          </p>
        </div>
      )}

      {currentPage === 'public-profile' && (
        <div style={styles.profileDisplay}>
          <h2>{profile.name}'s Profile</h2>
          <p><strong>DUPR Rating:</strong> {profile.dupr}</p>
          <p><strong>Play Times:</strong> {profile.playTimes?.join(', ')}</p>
          <p><strong>Locations:</strong> {profile.playLocations}</p>
          
          {user && savedProfileId !== user.uid && (
            <button style={styles.button} onClick={handleConnect}>
              Connect with {profile.name}
            </button>
          )}
          
          {!user && (
            <button style={styles.googleButton} onClick={handleGoogleSignIn}>
              Sign in to Connect
            </button>
          )}
          
          <button 
            style={{...styles.button, backgroundColor: '#6b7280', marginTop: '10px'}}
            onClick={() => window.location.href = '/'}
          >
            {user ? 'Back to Home' : 'Create Your Own Profile'}
          </button>
        </div>
      )}

      {currentPage === 'connections' && user && (
        <div>
          <h2>Your Connections</h2>
          {connections.length === 0 ? (
            <p>No connections yet. Tap NFC tags to connect with other players!</p>
          ) : (
            connections.map((conn, index) => (
              <div key={index} style={styles.connectionCard}>
                <strong>{conn.connectedToName}</strong> - DUPR: {conn.connectedToDupr}<br/>
                <small>Connected: {new Date(conn.connectedAt).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default App
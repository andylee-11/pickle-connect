import { useState, useEffect } from 'react'
import { useParams, useNavigate, Routes, Route } from 'react-router-dom'
import { auth, googleProvider, db } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore'
import QRCode from 'qrcode'

// Styles for Friendly Social UI
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#e53e3e',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  userEmail: {
    fontSize: '14px',
    color: '#666'
  },
  signOutBtn: {
    background: '#fff0f0',
    color: '#e53e3e',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#ffe5e5'
    }
  },
  navPills: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '5px'
  },
  navPill: {
    padding: '10px 24px',
    background: '#fff0f0',
    border: 'none',
    borderRadius: '25px',
    fontSize: '15px',
    cursor: 'pointer',
    color: '#e53e3e',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    fontWeight: '500'
  },
  navPillActive: {
    background: '#e53e3e',
    color: 'white'
  },
  content: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  welcomeCard: {
    background: 'white',
    padding: '40px 30px',
    borderRadius: '25px',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    marginTop: '20px'
  },
  welcomeEmoji: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  welcomeSubtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px'
  },
  primaryBtn: {
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '16px 40px',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      background: '#d63333',
      transform: 'translateY(-2px)'
    }
  },
  profileCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '25px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    marginBottom: '20px'
  },
  avatar: {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    borderRadius: '60px',
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: 'white',
    fontWeight: 'bold'
  },
  profileName: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '8px'
  },
  profileStatus: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '20px'
  },
  skillBadges: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  badge: {
    padding: '8px 20px',
    background: '#fff0f0',
    color: '#e53e3e',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginTop: '25px'
  },
  quickStat: {
    background: '#f8f8f8',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center'
  },
  statIcon: {
    fontSize: '24px',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  },
  formCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '25px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '25px',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '15px'
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': {
      borderColor: '#e53e3e'
    }
  },
  checkboxGroup: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#f8f8f8',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  qrSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '25px',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    marginBottom: '20px'
  },
  qrTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px'
  },
  urlBox: {
    background: '#f8f8f8',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '20px',
    wordBreak: 'break-all',
    fontSize: '14px',
    color: '#666'
  },
  connectionsList: {
    display: 'grid',
    gap: '15px'
  },
  connectionCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
    }
  },
  connectionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  connectionAvatar: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    borderRadius: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold'
  },
  connectionName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2px'
  },
  connectionDetail: {
    fontSize: '14px',
    color: '#666'
  },
  emptyState: {
    background: 'white',
    padding: '60px 30px',
    borderRadius: '25px',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  emptyStateIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  googleButton: {
    background: '#4285f4',
    color: 'white',
    border: 'none',
    padding: '16px 40px',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }
}

function PlayerProfile() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlayerProfile()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })
    return unsubscribe
  }, [playerId])

  const loadPlayerProfile = async () => {
    try {
      const docRef = doc(db, 'players', playerId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setPlayer(docSnap.data())
      } else {
        alert('Player not found!')
        navigate('/')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!currentUser) {
      await signInWithPopup(auth, googleProvider)
      return
    }
    
    try {
      // First get the current user's profile data
      const currentUserDoc = await getDoc(doc(db, 'players', currentUser.uid))
      
      if (!currentUserDoc.exists()) {
        alert('Please create your profile first!')
        navigate('/')
        return
      }
      
      const currentUserData = currentUserDoc.data()
      
      // Save connection for current user
      await setDoc(doc(collection(db, 'connections')), {
        userId: currentUser.uid,
        connectedToId: playerId,
        connectedToName: player.name,
        connectedToDupr: player.dupr,
        connectedAt: new Date().toISOString()
      })
      
      // Save reverse connection for the other player
      await setDoc(doc(collection(db, 'connections')), {
        userId: playerId,
        connectedToId: currentUser.uid,
        connectedToName: currentUserData.name,
        connectedToDupr: currentUserData.dupr,
        connectedAt: new Date().toISOString()
      })
      
      alert(`Connected with ${player.name}! 🎉`)
      window.location.href = '/'
    } catch (error) {
      console.error('Error saving connection:', error)
      alert('Error connecting. Please try again.')
    }
  }

  if (loading) return <div style={styles.container}>Loading...</div>
  if (!player) return <div style={styles.container}>Player not found</div>

  return (
    <div style={styles.container}>
      <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {player.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 style={styles.profileName}>{player.name}</h2>
          <p style={styles.profileStatus}>Ready to play! 🏓</p>
          
          <div style={styles.skillBadges}>
            <span style={styles.badge}>DUPR {player.dupr}</span>
            {player.playTimes?.map(time => (
              <span key={time} style={styles.badge}>{time} player</span>
            ))}
          </div>

          <div style={styles.quickStats}>
            <div style={styles.quickStat}>
              <div style={styles.statIcon}>📍</div>
              <div style={styles.statLabel}>{player.playLocations}</div>
            </div>
            <div style={styles.quickStat}>
              <div style={styles.statIcon}>⏰</div>
              <div style={styles.statLabel}>{player.playTimes?.join(', ')}</div>
            </div>
            <div style={styles.quickStat}>
              <div style={styles.statIcon}>🎯</div>
              <div style={styles.statLabel}>DUPR {player.dupr}</div>
            </div>
          </div>

          {currentUser && playerId !== currentUser.uid && (
            <button 
              style={{...styles.primaryBtn, width: '100%', marginTop: '25px', justifyContent: 'center'}}
              onClick={handleConnect}
            >
              Connect with {player.name.split(' ')[0]} 🤝
            </button>
          )}
          
          {!currentUser && (
            <button 
              style={{...styles.googleButton, width: '100%', marginTop: '25px', justifyContent: 'center'}}
              onClick={() => signInWithPopup(auth, googleProvider)}
            >
              Sign in to Connect 🔐
            </button>
          )}
          
          <button 
            style={{
              ...styles.primaryBtn, 
              background: '#f0f0f0', 
              color: '#666',
              width: '100%', 
              marginTop: '10px',
              justifyContent: 'center'
            }}
            onClick={() => window.location.href = '/'}
          >
            {currentUser ? 'Back to Home 🏠' : 'Create Your Profile ✨'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MainApp() {
  const navigate = useNavigate()
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
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await checkUserProfile(user.uid)
        await loadConnections(user.uid)
      }
      setInitializing(false)
    })
    return unsubscribe
  }, [])

  // Generate QR code when profile loads
  useEffect(() => {
    if (user && savedProfileId) {
      const profileUrl = `${window.location.origin}/player/${user.uid}`
      QRCode.toDataURL(profileUrl)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err))
    }
  }, [user, savedProfileId])

  const checkUserProfile = async (userId) => {
    try {
      const docRef = doc(db, 'players', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const userData = docSnap.data()
        setProfile(userData)
        setSavedProfileId(userId)
      }
    } catch (error) {
      console.error('Error checking profile:', error)
    }
  }

  const loadConnections = async (userId) => {
    if (!userId) return
    try {
      const connectionsQuery = query(collection(db, 'connections'), where('userId', '==', userId))
      const connectionsSnap = await getDocs(connectionsQuery)
      const userConnections = connectionsSnap.docs.map(doc => doc.data())
      setConnections(userConnections)
    } catch (error) {
      console.error('Error loading connections:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
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
      await setDoc(doc(db, 'players', user.uid), {
        ...profile,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      })
      
      setSavedProfileId(user.uid)
      alert('Profile saved! 🎉')
      setCurrentPage('view-profile')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return <div style={styles.container}>Loading...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <span>🏓</span>
            <span>Pickle Connect</span>
          </div>
          {user && (
            <div style={styles.userInfo}>
              <span style={styles.userEmail}>{user.email}</span>
              <button style={styles.signOutBtn} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
        
        {user && (
          <div style={styles.navPills}>
            <button 
              style={{...styles.navPill, ...(currentPage === 'home' ? styles.navPillActive : {})}}
              onClick={() => setCurrentPage('home')}
            >
              🏠 Home
            </button>
            <button 
              style={{...styles.navPill, ...(currentPage === 'profile' ? styles.navPillActive : {})}}
              onClick={() => setCurrentPage('profile')}
            >
              ✏️ {savedProfileId ? 'Edit Profile' : 'Create Profile'}
            </button>
            {savedProfileId && (
              <button 
                style={{...styles.navPill, ...(currentPage === 'view-profile' ? styles.navPillActive : {})}}
                onClick={() => setCurrentPage('view-profile')}
              >
                👤 My Profile
              </button>
            )}
            <button 
              style={{...styles.navPill, ...(currentPage === 'connections' ? styles.navPillActive : {})}}
              onClick={() => setCurrentPage('connections')}
            >
              👥 Connections
            </button>
          </div>
        )}
      </div>

      <div style={styles.content}>
        {currentPage === 'home' && (
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeEmoji}>🎾</div>
            <h1 style={styles.welcomeTitle}>Welcome to Pickle Connect!</h1>
            <p style={styles.welcomeSubtitle}>
              Share your player profile instantly with NFC tags or QR codes. 
              Connect with players, find your perfect match!
            </p>
            {!user ? (
              <button style={styles.googleButton} onClick={handleGoogleSignIn}>
                <span>🚀</span>
                <span>Get Started with Google</span>
              </button>
            ) : savedProfileId ? (
              <button 
                style={styles.primaryBtn}
                onClick={() => setCurrentPage('view-profile')}
              >
                <span>👀</span>
                <span>View Your Profile</span>
              </button>
            ) : (
              <button 
                style={styles.primaryBtn}
                onClick={() => setCurrentPage('profile')}
              >
                <span>✨</span>
                <span>Create Your Profile</span>
              </button>
            )}
          </div>
        )}

        {currentPage === 'profile' && user && (
          <form style={styles.formCard} onSubmit={handleSubmit}>
            <h2 style={styles.formTitle}>
              {savedProfileId ? '✏️ Edit Your Profile' : '✨ Create Your Profile'}
            </h2>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Name</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
                placeholder="John Doe"
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
                placeholder="3.5"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                style={styles.input}
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={{...styles.input, background: '#f8f8f8'}}
                type="email"
                name="email"
                value={profile.email || user?.email || ''}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>When do you like to play? 🌅</label>
              <div style={styles.checkboxGroup}>
                <label style={{
                  ...styles.checkboxLabel,
                  background: profile.playTimes.includes('morning') ? '#fff0f0' : '#f8f8f8',
                  color: profile.playTimes.includes('morning') ? '#e53e3e' : '#666'
                }}>
                  <input
                    style={styles.checkbox}
                    type="checkbox"
                    checked={profile.playTimes.includes('morning')}
                    onChange={() => handlePlayTimeChange('morning')}
                  />
                  Morning
                </label>
                <label style={{
                  ...styles.checkboxLabel,
                  background: profile.playTimes.includes('noon') ? '#fff0f0' : '#f8f8f8',
                  color: profile.playTimes.includes('noon') ? '#e53e3e' : '#666'
                }}>
                  <input
                    style={styles.checkbox}
                    type="checkbox"
                    checked={profile.playTimes.includes('noon')}
                    onChange={() => handlePlayTimeChange('noon')}
                  />
                  Noon
                </label>
                <label style={{
                  ...styles.checkboxLabel,
                  background: profile.playTimes.includes('night') ? '#fff0f0' : '#f8f8f8',
                  color: profile.playTimes.includes('night') ? '#e53e3e' : '#666'
                }}>
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
              <label style={styles.label}>Where do you like to play? 📍</label>
              <input
                style={styles.input}
                type="text"
                name="playLocations"
                value={profile.playLocations}
                onChange={handleInputChange}
                placeholder="Central Park Courts, Riverside Courts"
                required
              />
            </div>

            <button 
              style={{...styles.primaryBtn, width: '100%', justifyContent: 'center'}} 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Saving...' : savedProfileId ? 'Update Profile 💾' : 'Save Profile 🎉'}
            </button>
          </form>
        )}

        {currentPage === 'view-profile' && savedProfileId && user && (
          <>
            <div style={styles.profileCard}>
              <div style={styles.avatar}>
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 style={styles.profileName}>{profile.name}</h2>
              <p style={styles.profileStatus}>Ready to play! 🏓</p>
              
              <div style={styles.skillBadges}>
                <span style={styles.badge}>DUPR {profile.dupr}</span>
                {profile.playTimes.map(time => (
                  <span key={time} style={styles.badge}>{time} player</span>
                ))}
              </div>

              <div style={styles.quickStats}>
                <div style={styles.quickStat}>
                  <div style={styles.statIcon}>📍</div>
                  <div style={styles.statValue}>{profile.playLocations.split(',')[0]}</div>
                  <div style={styles.statLabel}>Main Court</div>
                </div>
                <div style={styles.quickStat}>
                  <div style={styles.statIcon}>📱</div>
                  <div style={styles.statValue}>{profile.phone}</div>
                  <div style={styles.statLabel}>Phone</div>
                </div>
                <div style={styles.quickStat}>
                  <div style={styles.statIcon}>✉️</div>
                  <div style={styles.statValue}>Contact</div>
                  <div style={styles.statLabel}>{profile.email}</div>
                </div>
              </div>
            </div>

            <div style={styles.qrSection}>
              <h3 style={styles.qrTitle}>Share Your Profile 🔗</h3>
              <div style={styles.urlBox}>
                {window.location.origin}/player/{user.uid}
              </div>
              {qrCodeUrl && (
                <div>
                  <img 
                    src={qrCodeUrl} 
                    alt="Profile QR Code" 
                    style={{width: '200px', height: '200px', borderRadius: '12px'}} 
                  />
                  <p style={{fontSize: '14px', color: '#666', marginTop: '15px'}}>
                    Scan this QR code or tap an NFC tag to share your profile instantly! ✨
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {currentPage === 'connections' && user && (
          <div>
            <h2 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center'}}>
              Your Pickleball Friends 👥
            </h2>
            {connections.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>🤔</div>
                <h3 style={{fontSize: '20px', marginBottom: '10px'}}>No connections yet!</h3>
                <p style={{color: '#666'}}>
                  Tap NFC tags or scan QR codes to connect with other players
                </p>
              </div>
            ) : (
              <div style={styles.connectionsList}>
                {connections.map((conn, index) => (
                  <div 
                    key={index} 
                    style={styles.connectionCard}
                    onClick={() => window.location.href = `/player/${conn.connectedToId}`}
                  >
                    <div style={styles.connectionInfo}>
                      <div style={styles.connectionAvatar}>
                        {conn.connectedToName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={styles.connectionName}>{conn.connectedToName}</div>
                        <div style={styles.connectionDetail}>
                          DUPR {conn.connectedToDupr} • Connected {new Date(conn.connectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{fontSize: '20px'}}>→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/player/:playerId" element={<PlayerProfile />} />
    </Routes>
  )
}

export default App
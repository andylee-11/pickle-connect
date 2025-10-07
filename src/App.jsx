import { useState, useEffect } from 'react'
import { useParams, useNavigate, Routes, Route } from 'react-router-dom'
import { auth, googleProvider, db } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore'
import QRCode from 'qrcode'

// Mobile-first styles for Friendly Social UI
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '80px' // Space for fixed nav on mobile
  },
  header: {
    backgroundColor: 'white',
    padding: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#e53e3e',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  userEmail: {
    fontSize: '12px',
    color: '#666',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  signOutBtn: {
    background: '#fff0f0',
    color: '#e53e3e',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  mobileNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0',
    zIndex: 100
  },
  mobileNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  mobileNavItemActive: {
    color: '#e53e3e'
  },
  mobileNavIcon: {
    fontSize: '24px',
    marginBottom: '4px'
  },
  content: {
    padding: '80px 16px 16px', // Top padding for fixed header
    maxWidth: '600px',
    margin: '0 auto'
  },
  welcomeCard: {
    background: 'white',
    padding: '32px 24px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginTop: '16px'
  },
  welcomeEmoji: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    lineHeight: '1.2'
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  primaryBtn: {
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    justifyContent: 'center'
  },
  profileCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginBottom: '16px'
  },
  avatar: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    borderRadius: '40px',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: 'white',
    fontWeight: 'bold'
  },
  profileName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '6px'
  },
  profileStatus: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '16px'
  },
  skillBadges: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  badge: {
    padding: '6px 16px',
    background: '#fff0f0',
    color: '#e53e3e',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500'
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginTop: '20px'
  },
  quickStat: {
    background: '#f8f8f8',
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statIcon: {
    fontSize: '20px',
    width: '40px',
    height: '40px',
    background: '#fff0f0',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '14px',
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
    padding: '24px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #f0f0f0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none'
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    background: '#f8f8f8',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  qrSection: {
    background: 'white',
    padding: '24px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginBottom: '16px'
  },
  qrTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px'
  },
  urlBox: {
    background: '#f8f8f8',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '16px',
    wordBreak: 'break-all',
    fontSize: '12px',
    color: '#666'
  },
  connectionsList: {
    display: 'grid',
    gap: '12px'
  },
  connectionCard: {
    background: 'white',
    padding: '16px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  connectionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  connectionAvatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  connectionName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2px'
  },
  connectionDetail: {
    fontSize: '12px',
    color: '#666'
  },
  emptyState: {
    background: 'white',
    padding: '48px 24px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  googleButton: {
    background: '#4285f4',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    justifyContent: 'center'
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
      const currentUserDoc = await getDoc(doc(db, 'players', currentUser.uid))
      
      if (!currentUserDoc.exists()) {
        alert('Please create your profile first!')
        navigate('/')
        return
      }
      
      const currentUserData = currentUserDoc.data()
      
      await setDoc(doc(collection(db, 'connections')), {
        userId: currentUser.uid,
        connectedToId: playerId,
        connectedToName: player.name,
        connectedToDupr: player.dupr,
        connectedAt: new Date().toISOString()
      })
      
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
      <div style={{padding: '16px', paddingTop: '80px', maxWidth: '600px', margin: '0 auto'}}>
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
              <div style={styles.statContent}>
                <div style={styles.statValue}>{player.playLocations}</div>
                <div style={styles.statLabel}>Courts</div>
              </div>
            </div>
            <div style={styles.quickStat}>
              <div style={styles.statIcon}>⏰</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{player.playTimes?.join(', ')}</div>
                <div style={styles.statLabel}>Available Times</div>
              </div>
            </div>
          </div>

          {currentUser && playerId !== currentUser.uid && (
            <button 
              style={{...styles.primaryBtn, marginTop: '20px'}}
              onClick={handleConnect}
            >
              Connect with {player.name.split(' ')[0]} 🤝
            </button>
          )}
          
          {!currentUser && (
            <button 
              style={{...styles.googleButton, marginTop: '20px'}}
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
              marginTop: '10px'
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
      </div>

      <div style={styles.content}>
        {currentPage === 'home' && (
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeEmoji}>🎾</div>
            <h1 style={styles.welcomeTitle}>Welcome to Pickle Connect!</h1>
            <p style={styles.welcomeSubtitle}>
              Share your player profile instantly with NFC tags or QR codes.
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
                  gridColumn: 'span 2',
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
                placeholder="Central Park Courts"
                required
              />
            </div>

            <button 
              style={styles.primaryBtn} 
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
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{profile.playLocations}</div>
                    <div style={styles.statLabel}>Courts</div>
                  </div>
                </div>
                <div style={styles.quickStat}>
                  <div style={styles.statIcon}>📱</div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{profile.phone}</div>
                    <div style={styles.statLabel}>Phone</div>
                  </div>
                </div>
                <div style={styles.quickStat}>
                  <div style={styles.statIcon}>✉️</div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{profile.email}</div>
                    <div style={styles.statLabel}>Email</div>
                  </div>
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
                    style={{width: '160px', height: '160px', borderRadius: '12px'}} 
                  />
                  <p style={{fontSize: '13px', color: '#666', marginTop: '12px'}}>
                    Scan or tap NFC tag to share! ✨
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {currentPage === 'connections' && user && (
          <div>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center'}}>
              Your Pickleball Friends 👥
            </h2>
            {connections.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>🤔</div>
                <h3 style={{fontSize: '18px', marginBottom: '8px'}}>No connections yet!</h3>
                <p style={{color: '#666', fontSize: '14px'}}>
                  Tap NFC tags or scan QR codes to connect
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
                          DUPR {conn.connectedToDupr} • {new Date(conn.connectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{fontSize: '18px', color: '#e53e3e'}}>→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {user && (
        <nav style={styles.mobileNav}>
          <button 
            style={{
              ...styles.mobileNavItem,
              ...(currentPage === 'home' ? styles.mobileNavItemActive : {})
            }}
            onClick={() => setCurrentPage('home')}
          >
            <span style={styles.mobileNavIcon}>🏠</span>
            <span>Home</span>
          </button>
          <button 
            style={{
              ...styles.mobileNavItem,
              ...(currentPage === 'profile' ? styles.mobileNavItemActive : {})
            }}
            onClick={() => setCurrentPage('profile')}
          >
            <span style={styles.mobileNavIcon}>✏️</span>
            <span>Edit</span>
          </button>
          {savedProfileId && (
            <button 
              style={{
                ...styles.mobileNavItem,
                ...(currentPage === 'view-profile' ? styles.mobileNavItemActive : {})
              }}
              onClick={() => setCurrentPage('view-profile')}
            >
              <span style={styles.mobileNavIcon}>👤</span>
              <span>Profile</span>
            </button>
          )}
          <button 
            style={{
              ...styles.mobileNavItem,
              ...(currentPage === 'connections' ? styles.mobileNavItemActive : {})
            }}
            onClick={() => setCurrentPage('connections')}
          >
            <span style={styles.mobileNavIcon}>👥</span>
            <span>Friends</span>
          </button>
        </nav>
      )}
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
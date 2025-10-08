import { useState, useEffect } from 'react'
import { useParams, useNavigate, Routes, Route } from 'react-router-dom'
import { auth, googleProvider, db } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore'
import QRCode from 'qrcode'
import { styles } from './styles'
import ProfileIcon from './assets/icons/profile.svg'
import EditIcon from './assets/icons/edit.svg'
import ConnectionIcon from './assets/icons/connection.svg'
import CourtsIcon from './assets/icons/courts.svg'
import PhoneIcon from './assets/icons/phone.svg'
import EmailIcon from './assets/icons/email.svg'
import LinkIcon from './assets/icons/link.svg'
import TimeIcon from './assets/icons/time.svg'


// Onboarding component
function Onboarding({ onComplete, connectToPlayer }) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    name: '',
    dupr: '',
    phone: '',
    email: '',
    playTimes: [],
    playLocations: ''
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      // Clear any existing auth state
      await auth.signOut();

      // Force account selection
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider)
      const googleUser = result.user
      setUser(googleUser)
      
      // Check if user already has a profile
      const docRef = doc(db, 'players', googleUser.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        // User already has a profile
        if (connectToPlayer) {
          // They came from a player profile, need to make connection
          try {
            const currentUserData = docSnap.data()

            // Check if connection already exists
            const existingConnectionQuery = query(
              collection(db, 'connections'), 
              where('userId', '==', googleUser.uid),
              where('connectedToId', '==', connectToPlayer)
            )
            const existingConnection = await getDocs(existingConnectionQuery)

            if (!existingConnection.empty) {
              alert('You are already connected with this player!')
              onComplete()
              return
            }
            
            // Get the player they want to connect with
            const targetPlayerDoc = await getDoc(doc(db, 'players', connectToPlayer))
            if (targetPlayerDoc.exists()) {
              const targetPlayerData = targetPlayerDoc.data()
              
              // Create bidirectional connection
              await setDoc(doc(collection(db, 'connections')), {
                userId: googleUser.uid,
                connectedToId: connectToPlayer,
                connectedToName: targetPlayerData.name,
                connectedToDupr: targetPlayerData.dupr,
                connectedAt: new Date().toISOString()
              })
              
              await setDoc(doc(collection(db, 'connections')), {
                userId: connectToPlayer,
                connectedToId: googleUser.uid,
                connectedToName: currentUserData.name,
                connectedToDupr: currentUserData.dupr,
                connectedAt: new Date().toISOString()
              })
              
              alert(`Connected with ${targetPlayerData.name}! 🎉`)
            }
          } catch (error) {
            console.error('Error creating connection:', error)
          }
        }
        onComplete()
      } else {
        // New user, continue to step 2
        setProfile(prev => ({
          ...prev,
          email: googleUser.email,
          name: googleUser.displayName || prev.name
        }))
        setStep(2)
      }
    } catch (error) {
      console.error('Error signing in:', error)
      alert('Error signing in with Google')
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
    setLoading(true)
    
    try {
      await setDoc(doc(db, 'players', user.uid), {
        ...profile,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      })
      
      // If they came from a player profile, create connection after profile creation
      if (connectToPlayer) {
        try {

          // Check if connection already exists
          const existingConnectionQuery = query(
            collection(db, 'connections'), 
            where('userId', '==', user.uid),
            where('connectedToId', '==', connectToPlayer)
          )
          const existingConnection = await getDocs(existingConnectionQuery)

          if (!existingConnection.empty) {
            alert('You are already connected with this player!')
            onComplete()
            return
          }

          const targetPlayerDoc = await getDoc(doc(db, 'players', connectToPlayer))
          if (targetPlayerDoc.exists()) {
            const targetPlayerData = targetPlayerDoc.data()
            
            await setDoc(doc(collection(db, 'connections')), {
              userId: user.uid,
              connectedToId: connectToPlayer,
              connectedToName: targetPlayerData.name,
              connectedToDupr: targetPlayerData.dupr,
              connectedAt: new Date().toISOString()
            })
            
            await setDoc(doc(collection(db, 'connections')), {
              userId: connectToPlayer,
              connectedToId: user.uid,
              connectedToName: profile.name,
              connectedToDupr: profile.dupr,
              connectedAt: new Date().toISOString()
            })
            
            alert(`Connected with ${targetPlayerData.name}! 🎉`)
          }
        } catch (error) {
          console.error('Error creating connection:', error)
        }
      }
      
      onComplete()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <span>🏓</span>
            <span>Pickle Connect</span>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {step === 1 && (
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeEmoji}>🎾</div>
            <h1 style={styles.welcomeTitle}>Welcome to Pickle Connect!</h1>
            <p style={styles.welcomeSubtitle}>
              Share your player profile instantly with NFC tags or QR codes. 
              Connect with players, find your perfect match!
            </p>
            <button style={styles.googleButton} onClick={handleGoogleSignIn}>
              <span>🚀</span>
              <span>Get Started with Google</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <form style={styles.formCard} onSubmit={handleSubmit}>
            <h2 style={styles.formTitle}>Create Your Player Profile</h2>
            
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
              <label style={styles.label}>When do you like to play?</label>
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
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function PlayerProfile() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

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
      setShowOnboarding(true)
      return
    }
    
    try {
      const currentUserDoc = await getDoc(doc(db, 'players', currentUser.uid))
      
      if (!currentUserDoc.exists()) {
        setShowOnboarding(true)
        return
      }
      
      // Check if connection already exists
      const existingConnectionQuery = query(
        collection(db, 'connections'), 
        where('userId', '==', currentUser.uid),
        where('connectedToId', '==', playerId)
      )
      const existingConnection = await getDocs(existingConnectionQuery)

      if (!existingConnection.empty) {
        alert('You are already connected with this player!')
        window.location.href = '/'
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

  const handleOnboardingComplete = () => {
    window.location.href = '/'
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} connectToPlayer={playerId} />
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
              <div style={styles.statIcon}>
                <img src={CourtsIcon} alt="Courts" style={{width: '20px', height: '20px'}} />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{player.playLocations}</div>
                <div style={styles.statLabel}>Courts</div>
              </div>
            </div>
            <div style={styles.quickStat}>
              <div style={styles.statIcon}>
                <img src={TimeIcon} alt="Time" style={{width: '20px', height: '20px'}} />
              </div>
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
              style={{...styles.primaryBtn, marginTop: '20px'}}
              onClick={() => setShowOnboarding(true)}
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
  const [currentPage, setCurrentPage] = useState('profile')
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
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const hasProfile = await checkUserProfile(user.uid)
        if (!hasProfile) {
          setShowOnboarding(true)
        } else {
          await loadConnections(user.uid)
        }
      } else {
        setShowOnboarding(true)
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
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking profile:', error)
      return false
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
      setShowOnboarding(true)
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
      alert('Profile updated! 🎉')
      setCurrentPage('profile')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/player/${user.uid}`
    navigator.clipboard.writeText(profileUrl)
      .then(() => alert('Profile link copied!'))
      .catch(() => alert('Failed to copy link'))
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    window.location.reload()
  }

  if (initializing) {
    return <div style={styles.container}>Loading...</div>
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <span>🏓</span>
            <span>Pickle Connect</span>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {currentPage === 'profile' && (
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
                  <div style={styles.statIcon}>
                    <img src={CourtsIcon} alt="Courts" style={{width: '20px', height: '20px'}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{profile.playLocations}</div>
                    <div style={styles.statLabel}>Courts</div>
                  </div>
                </div>
                <div style={styles.quickStat}>
                  <div style={styles.statIcon}>
                    <img src={PhoneIcon} alt="Phone" style={{width: '20px', height: '20px'}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{profile.phone || 'Not set'}</div>
                    <div style={styles.statLabel}>Phone</div>
                  </div>
                </div>
                <div style={styles.quickStat}>
                  <div style={styles.statIcon}>
                    <img src={EmailIcon} alt="Email" style={{width: '20px', height: '20px'}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{profile.email}</div>
                    <div style={styles.statLabel}>Email</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.qrSection}>
              <h3 style={styles.qrTitle}>Share Your Profile</h3>
              <div style={styles.urlBox}>
                {window.location.origin}/player/{user?.uid}
              </div>
              <button 
                style={{
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
                onClick={copyProfileLink}
              >
                <img src={LinkIcon} alt="Copy" style={{width: '16px', height: '16px', verticalAlign: 'middle', marginLeft: '4px', marginRight: '4px'}} />
                Copy Link
              </button>
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

            <div style={styles.signOutSection}>
              <button style={styles.signOutBtn} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </>
        )}

        {currentPage === 'edit' && (
          <form style={styles.formCard} onSubmit={handleSubmit}>
            <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center'}}>
              Edit Your Profile
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
              <label style={styles.label}>When do you like to play? 🌅</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: profile.playTimes.includes('morning') ? '#fff0f0' : '#f8f8f8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: profile.playTimes.includes('morning') ? '#e53e3e' : '#666'
                }}>
                  <input
                    type="checkbox"
                    checked={profile.playTimes.includes('morning')}
                    onChange={() => handlePlayTimeChange('morning')}
                  />
                  Morning
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: profile.playTimes.includes('noon') ? '#fff0f0' : '#f8f8f8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: profile.playTimes.includes('noon') ? '#e53e3e' : '#666'
                }}>
                  <input
                    type="checkbox"
                    checked={profile.playTimes.includes('noon')}
                    onChange={() => handlePlayTimeChange('noon')}
                  />
                  Noon
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: profile.playTimes.includes('night') ? '#fff0f0' : '#f8f8f8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  gridColumn: 'span 2',
                  color: profile.playTimes.includes('night') ? '#e53e3e' : '#666'
                }}>
                  <input
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
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        )}

        {currentPage === 'connections' && (
          <div>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center'}}>
              Your Pickleball Friends
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
              ...(currentPage === 'profile' ? styles.mobileNavItemActive : {})
            }}
            onClick={() => setCurrentPage('profile')}
          >
            <img src={ProfileIcon} alt="Profile" style={{width: '24px', height: '24px', marginBottom: '4px'}} />
            <span>Profile</span>
          </button>
          <button 
            style={{
              ...styles.mobileNavItem,
              ...(currentPage === 'edit' ? styles.mobileNavItemActive : {})
            }}
            onClick={() => setCurrentPage('edit')}
          >
            <img src={EditIcon} alt="Edit" style={{width: '24px', height: '24px', marginBottom: '4px'}} />
            <span>Edit</span>
          </button>
          <button 
            style={{
              ...styles.mobileNavItem,
              ...(currentPage === 'connections' ? styles.mobileNavItemActive : {})
            }}
            onClick={() => setCurrentPage('connections')}
          >
            <img src={ConnectionIcon} alt="Connection" style={{width: '24px', height: '24px', marginBottom: '4px'}} />
            <span>Connections</span>
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
// Mobile-first styles for Friendly Social UI
export const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff5f5',
    fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '80px'
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
    justifyContent: 'center'
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#e53e3e',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
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
    zIndex: 100, 
    borderRadius: 50,
    margin: 10
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
    transition: 'all 0.2s',
    flex: '1 0 0',
    minWidth: '0'
  },
  mobileNavItemActive: {
    color: '#e53e3e'
  },
  mobileNavIcon: {
    fontSize: '24px',
    marginBottom: '4px'
  },
  content: {
    padding: '80px 16px 16px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  // Onboarding styles
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
    gap: '8px',
    width: '100%',
    justifyContent: 'center'
  },
  // Profile creation form styles
  formCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '25px',
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
  primaryBtn: {
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    justifyContent: 'center', 
    fontFamily: 'inherit'
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
  // Profile styles
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
  signOutSection: {
    textAlign: 'center',
    marginTop: '32px',
    paddingBottom: '20px'
  },
  signOutBtn: {
    background: '#fff0f0',
    color: '#e53e3e',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
  }
}
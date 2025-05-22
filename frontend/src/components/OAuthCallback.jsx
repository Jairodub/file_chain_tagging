import { useEffect , useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth_context';

export function OAuthCallback() {
  const { completeLogin } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (isProcessing) return;
      setIsProcessing(true);
      
      try {
        if (window.location.pathname !== '/oauth/callback') {
          throw new Error('Invalid callback route');
        }

        const hash = window.location.hash.substring(1);
        if (!hash) {
          throw new Error('No hash fragment in callback URL');
        }

        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        
        if (!idToken) {
          throw new Error('No ID token received');
        }

        await completeLogin(idToken);
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/?error=auth_failed', { replace: true });
      }
    };

    handleCallback();
  }, [completeLogin, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#111827',
      color: '#E2E8F0'
    }}>
      <div>Completing login...</div>
    </div>
  );
}
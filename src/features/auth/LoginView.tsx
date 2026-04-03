import React, { useState } from 'react';
import { 
  Shield, 
  Mail, 
  Lock, 
  LogIn, 
  GraduationCap, 
  Users 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

interface LoginViewProps {
  onEmailLogin: (email: string, pass: string) => Promise<void>;
  onGoogleLogin: (role: 'teacher' | 'student' | 'admin') => Promise<void>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onEmailLogin, onGoogleLogin }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [adminEmail, setAdminEmail] = useState('cuonglhv@jaxtina.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'teacher' | 'student' | null>(null);

  const handleAdminLogin = async () => {
    setLoginError(null);
    try {
      await signIn(adminEmail, adminPassword);
      navigate('/admin');
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Admin Login Card */}
        <Card className="p-8 text-center flex flex-col items-center hover:shadow-xl transition-all duration-300 border-t-4 border-purple-600">
          <div className="bg-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600 mb-6 flex-1">
            Access system administration to manage users and platform settings.
          </p>

          <div className="w-full space-y-4 mb-6">
            <div className="relative text-left">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Admin Email"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
            <div className="relative text-left">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Admin Password"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            {loginError && role === 'admin' && (
              <p className="text-xs text-red-500 mt-1">{loginError}</p>
            )}
            <Button 
              onClick={() => { setRole('admin'); handleAdminLogin(); }} 
              className="w-full py-3 text-sm bg-purple-600 hover:bg-purple-700 border-none"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login with Email
            </Button>
          </div>

          <div className="w-full flex items-center gap-4 mb-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <Button 
            variant="secondary"
            onClick={() => onGoogleLogin('admin')} 
            className="w-full py-3 text-sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login with Google
          </Button>
        </Card>

        {/* Teacher Login Card */}
        <Card className="p-8 text-center flex flex-col items-center hover:shadow-xl transition-all duration-300 border-t-4 border-indigo-600">
          <div className="bg-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Teacher Portal</h1>
          <p className="text-gray-600 mb-8 flex-1">
            Access the management dashboard to manage classes, students, and academic reports.
          </p>
          <Button onClick={() => onGoogleLogin('teacher')} className="w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-700">
            <LogIn className="w-5 h-5 mr-2" />
            Login as Teacher
          </Button>
        </Card>

        {/* Student Login Card */}
        <Card className="p-8 text-center flex flex-col items-center hover:shadow-xl transition-all duration-300 border-t-4 border-emerald-600">
          <div className="bg-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h1>
          <p className="text-gray-600 mb-6 flex-1">
            View your enrolled classes, check homework assignments, and see exam results.
          </p>
          
          <div className="w-full space-y-4 mb-6">
            <div className="relative text-left">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Registered Email"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
            </div>
            <div className="relative text-left">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
              />
            </div>
            {loginError && role === 'student' && (
              <p className="text-xs text-red-500 mt-1">{loginError}</p>
            )}
            <Button 
              onClick={async () => {
                setRole('student');
                setLoginError(null);
                try {
                  await onEmailLogin(studentEmail, studentPassword);
                } catch (err: any) {
                  setLoginError(err.message || 'Login failed.');
                }
              }} 
              className="w-full py-3 text-sm bg-emerald-600 hover:bg-emerald-700 border-none"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login with Email
            </Button>
          </div>

          <div className="w-full flex items-center gap-4 mb-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <Button 
            variant="secondary"
            onClick={() => onGoogleLogin('student')} 
            className="w-full py-3 text-sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login with Google
          </Button>
        </Card>
      </div>
    </div>
  );
};

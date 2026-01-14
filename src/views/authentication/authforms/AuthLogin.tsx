import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Checkbox } from 'src/components/ui/checkbox';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { loginUser } from 'src/store/slices/authSlice';
import type { AppDispatch } from 'src/store/store';
import type { RootState } from 'src/store/store';

const AuthLogin = () => {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('123456789');
  const [remember, setRemember] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(loginUser({ email, password }));
      console.log({result})
      if (loginUser.fulfilled.match(result)) {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email">Email</Label>
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked as boolean)}
              className="checkbox"
            />
            <Label htmlFor="remember" className="opacity-90 font-normal cursor-pointer">
              Remember this Device
            </Label>
          </div>
          <Link to={'/auth/auth2/forgot-password'} className="text-primary text-sm font-medium">
            Forgot Password ?
          </Link>
        </div>
        
        <Button type="submit"  className="w-full">
           Sign in
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;

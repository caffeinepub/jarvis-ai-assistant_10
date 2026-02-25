import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    name?: string;
    id?: string;
    required?: boolean;
    className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    placeholder = 'Password',
    name,
    id,
    required,
    className = '',
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                name={name}
                id={id}
                required={required}
                className={`w-full px-4 py-3 pr-12 rounded-sm jarvis-input ${className}`}
            />
            <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-jarvis transition-colors"
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                ) : (
                    <Eye className="w-5 h-5" />
                )}
            </button>
        </div>
    );
};

export default PasswordInput;

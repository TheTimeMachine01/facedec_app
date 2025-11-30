import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signup } = useAuth(); // NEW: Get the signup function from context

    const handleSignup = async () => {
        setLoading(true);
        setError('');

        // --- Basic Client-Side Validation ---
        if (!email.trim()) {
            setError('Email is required.');
            setLoading(false);
            return;
        }
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }
        if (!password.trim()) {
            setError('Password is required.');
            setLoading(false);
            return;
        }
        if (password.length < 6) { // Basic password length check
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
        // --- End Basic Client-Side Validation ---

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        // --- Replace with your actual authentication logic ---
        console.log('Attempting signup with:', { email, password });
        // NEW: Call the signup function from AuthContext
        const success = await signup(email, password);
        if (!success) {
            // The AuthContext's signup function will return false on failure
            setError('Signup failed. Please try again.');
        } else {
            // If signup is successful, you might want to redirect to login
            // if your backend doesn't auto-login after signup.
            router.replace('/(auth)/login');
        }
        setLoading(false); // Ensure loading state is reset
    };

    return (

        <>

            <AnimatedGradientBackground />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <YStack
                        space="$4"
                        width="100%"
                        maxWidth={400}
                        padding="$6"
                        borderRadius="$6"
                        backgroundColor="$background"
                        shadowColor="$shadowColor"
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.1}
                        shadowRadius={3}
                    >
                        <H2 textAlign="center" color="$color">Create an Account</H2>
                        <Paragraph textAlign="center" color="$color">Join us today!</Paragraph>

                        <Input
                            size="$4"
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            borderColor="$borderColor"
                        />
                        <Input
                            size="$4"
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            borderColor="$borderColor"
                        />
                        <Input
                            size="$4"
                            placeholder="Confirm Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            borderColor="$borderColor"
                        />

                        {error ? (
                            <Text color="$red9" textAlign="center" fontSize="$3">
                                {error}
                            </Text>
                        ) : null}

                        <Button
                            size="$5"
                            mt='$4'
                            onPress={handleSignup}
                            disabled={loading}
                            theme="green" // Example of using a theme
                        >
                            <Text>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
                        </Button>

                        <XStack justifyContent="center" alignItems="center" space="$2">
                            <Text fontSize="$3" color="$color">Already have an account?</Text>
                            <Button
                                variant="text"
                                onPress={() => {
                                    // Navigate to Login screen
                                    console.log('Navigate to Login');
                                    router.push('/(auth)/login');

                                    // Example with Expo Router: router.push('/login');
                                }}
                                color="$blue9"
                                paddingHorizontal="$2"
                            >
                                <Text>Login</Text>
                            </Button>
                        </XStack>
                    </YStack>
                </ScrollView>
            </KeyboardAvoidingView>


        </>

    );
}
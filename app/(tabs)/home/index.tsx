import AttendanceModal from '@/components/AttendanceModal';
import { API_ROUTES } from '@/constants/apiRoutes';
import api from '@/services/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Spinner, Stack, Text, XStack, YStack } from 'tamagui';

export default function HomeScreen() {

    const router = useRouter();

    const [isShiftStart, setIsShiftStart] = useState(false);
    const [isShiftEnd, setIsShiftEnd] = useState(false);

    const [isTodayMarked, setIsTodayMarked] = useState(true);
    const [todayMarkedError, setTodayMarkedError] = useState<string | null>(null);

    const [isClockingOut, setIsClockingOut] = useState(false);

    const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);

    const [userName, setUserName] = useState("User!");

    // const [hasInTime, setHasInTime] = useState(false);
    // const [hasOutTime, setHasOutTime] = useState(false);



    useEffect(() => {
        const fetchAttendanceStatus = async () => {
            try {
                // In time checking
                const hasInTimeResponse = await api.get(API_ROUTES.HASINTIMETODAY);
                const hasInTime = hasInTimeResponse.data?.hasInTime;
                setIsShiftStart(hasInTime);
                console.log("Today in " + hasInTime);

                // Out time checking
                const hasOutTimeResponse = await api.get(API_ROUTES.HASOUTTIMETODAY);
                const hasOutTime = hasOutTimeResponse.data?.hasOutTime;
                setIsShiftEnd(hasOutTime);
                console.log("Today out " + hasOutTime);

                const currentUser = await api.get(API_ROUTES.ME);
                setUserName(currentUser.data?.name);
                console.log("User name is:"+ currentUser.data?.name);

            } catch (error: any) {
                console.error('Error with attendance API:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred while checking today\'s attendance!';
                setTodayMarkedError(errorMessage);
                Alert.alert('Error', errorMessage);
            } finally {
                setIsTodayMarked(false);
            }
        };

        fetchAttendanceStatus();
    }, []); // Empty dependency array to run only once on mount

    // Show loading spinner if user data is still being fetched
    if (isTodayMarked) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" bg="$background">
                <Spinner size="large" color="$color10" />
                <Text mt="$4">Fetching user details...</Text>
            </YStack>
        );
    }


    const handleClockInPress = () => {
        console.log("Modal is opening");
        setAttendanceModalVisible(true);
    };



    const handleButtonPress = () => {
        if (!isShiftStart) {
            handleClockInPress();
        } else if (!isShiftEnd) {
            handleClockOutPress();
        }
    }

    const handleModalClose = () => {
        setAttendanceModalVisible(false);
    }

    const handleAttendanceSuccess = () => {
        setIsShiftStart(true); // Update the state
        setAttendanceModalVisible(false); // Make sure the modal is closed
    };

    const handleClockOutSuccess = () => {
        setIsShiftEnd(true);
    };

    const handleClockOutPress = async () => {
        console.log('Clock out Attendance button pressed!');
        setIsClockingOut(true);

        try {
            const outLogPayload = {

                latitude: 1234.00,
                longitude: 4321.00,
            };

            const outLogResponse = await api.post(API_ROUTES.OUTLOG, outLogPayload);

            if (outLogResponse.data?.status === true) {
                Alert.alert('Shift Ended', 'See you next time.');
                handleClockOutSuccess();
            } else {
                Alert.alert('Error', outLogResponse.data?.message || 'Failed to start shift.');
            }

        } catch (error: any) {
            console.error('Error with attendance API:', error);
            Alert.alert('Attendance Error', error.response?.data?.message || 'An error occurred with the attendance API.');
        } finally {
            setIsClockingOut(false);
        }
    };

    return (
        <Stack flex={1} p="$4" bg="$background">

            {/* Profile Card */}
            <YStack bg="$color1" p="$6" br="$4" mb="$4" elevation={2} alignItems="center">
                <MaterialCommunityIcons name="account-circle" size={120} color="#fff" />
                <Text fontWeight="bold" fontSize="$9" mt="$4">Welcome, {userName}</Text>
                <Text color="$color10" fontSize="$5">Have a productive day!</Text>
            </YStack>

            {/* Current Status Card */}
            <YStack bg="$color2" p="$4" br="$4" mb="$4" elevation={2} borderRadius={10}>
                <XStack alignItems="center" mb="$2">
                    <MaterialCommunityIcons name="check-circle" size={20} color="green" />
                    <Text fontWeight="bold" ml="$2">Current Status Card</Text>
                </XStack>
                <Text>
                    Today's Status: {!isShiftStart && !isShiftEnd ? (
                        <Text color="$yellow10">Attendance Pending</Text>
                    ) : isShiftStart && !isShiftEnd ? (
                         <Text color="$green10">Clocked In</Text>
                    ) : (
                        <Text color="$black10">Clocked Out</Text>
                    )}
                </Text>
                <XStack mt="$2" gap="$4">
                    <Text fontSize="$7" fontWeight="bold">09:00 AM</Text>
                    <Text fontSize="$7" fontWeight="bold">|</Text>
                    <Text fontSize="$7" fontWeight="bold">--:-- PM</Text>
                </XStack>
            </YStack>

            <Button
                size="$6"
                theme="active"
                mb="$4"
                bg={isShiftStart && isShiftEnd ? "$black4" : "$red10"}
                color="white"
                borderRadius={20}
                width="100%"
                fontSize="$6"
                icon={
                    <MaterialCommunityIcons
                        name={!isShiftStart ? "login" : !isShiftEnd ? "logout" : "check-circle"}
                        size={24}
                        color="white"
                    />
                }
                onPress={handleButtonPress}
                disabled={isShiftStart && isShiftEnd}
            >
                {!isShiftStart ? 'Clock In' : !isShiftEnd ? 'Clock Out' : 'Shift Completed'}
            </Button>

            {/* Attendance Summary */}
            <YStack gap="$2">
                <YStack bg="$color2" p="$4" elevation={2} br={10}>
                    <XStack ai="center">
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#007AFF" />
                        <Text ml="$2" fontWeight="bold">Total Hours This Week: <Text fontSize="$6">32h</Text></Text>
                    </XStack>
                </YStack>
                <YStack bg="$color2" p="$4" elevation={2} br={10}>
                    <XStack ai="center">
                        <MaterialCommunityIcons name="calendar-check-outline" size={20} color="#34C759" />
                        <Text ml="$2" fontWeight="bold">Leaves Remaining: <Text fontSize="$6">2</Text></Text>
                    </XStack>
                </YStack>
                {attendanceModalVisible && (
                    <AttendanceModal
                        visible={attendanceModalVisible}
                        onClose={handleModalClose}
                        onSuccess={handleAttendanceSuccess}
                    />
                )}
            </YStack>



        </Stack>
    );
}


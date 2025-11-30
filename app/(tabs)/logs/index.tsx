import RequestChangeModal from '@/components/RequestChangeModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo, useState } from 'react';
import { Button, ScrollView, Stack, Text, XStack, YStack } from "tamagui";

// Status keys type
type StatusKey = 'P' | 'L' | 'A' | 'NA' | 'CH';

// Dummy data for demonstration
const attendanceData: {
    date: string;
    day: string;
    in: string;
    out: string;
    status: StatusKey;
}[] = [
        { date: '2025-06-01', day: 'Mon', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-02', day: 'Tue', in: '09:10 AM', out: '06:00 PM', status: 'L' },
        { date: '2025-06-03', day: 'Wed', in: '--:--', out: '--:--', status: 'A' },
        { date: '2025-06-04', day: 'Thu', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-05', day: 'Fri', in: '--:--', out: '--:--', status: 'NA' },
        { date: '2025-06-06', day: 'Sat', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-07', day: 'Sun', in: '--:--', out: '--:--', status: 'CH' },
        { date: '2025-06-08', day: 'Mon', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-09', day: 'Tue', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-10', day: 'Wed', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-11', day: 'Thu', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-12', day: 'Fri', in: '--:--', out: '--:--', status: 'NA' },
        { date: '2025-06-13', day: 'Sat', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-14', day: 'Sun', in: '--:--', out: '--:--', status: 'CH' },
        { date: '2025-06-15', day: 'Mon', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-16', day: 'Tue', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-17', day: 'Wed', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-18', day: 'Thu', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-19', day: 'Fri', in: '--:--', out: '--:--', status: 'NA' },
        { date: '2025-06-20', day: 'Sat', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-21', day: 'Sun', in: '--:--', out: '--:--', status: 'CH' },
        { date: '2025-06-22', day: 'Mon', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-23', day: 'Tue', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-24', day: 'Wed', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-25', day: 'Thu', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-26', day: 'Fri', in: '--:--', out: '--:--', status: 'NA' },
        { date: '2025-06-27', day: 'Sat', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-28', day: 'Sun', in: '--:--', out: '--:--', status: 'CH' },
        { date: '2025-06-29', day: 'Mon', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-06-30', day: 'Tue', in: '09:00 AM', out: '06:00 PM', status: 'P' },
        { date: '2025-07-01', day: 'Wed', in: '09:00 AM', out: '06:00 PM', status: 'P' }
        
    ];

// Status legend
const statusMap: Record<StatusKey, { label: string; color: string }> = {
    P: { label: 'Present', color: '#34C759' },
    L: { label: 'Late', color: '#FFD600' },
    A: { label: 'Absent', color: '#FF3B30' },
    NA: { label: 'Not Available', color: '#B0B0B0' },
    CH: { label: 'Company Holiday', color: '#007AFF' },
};


export default function LogsScreen() {

    const initialMonth = new Date(); // Gets current actual date (July 15, 2025)
    initialMonth.setDate(1); // Sets it to the 1st of the current actual month (July 1, 2025)

    const [currentMonth, setCurrentMonth] = useState(initialMonth); // Start with June 2025 (Month is 0-indexed)

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState<null | typeof attendanceData[0]>(null);
    
    // Get the actual current month and year
    const today = useMemo(() => new Date(), []); // Memoize today's date
    const currentActualMonth = today.getMonth();
    const currentActualYear = today.getFullYear();

    // Determine if the "next" button should be disabled
    const isNextButtonDisabled = useMemo(() => {
        return (
            currentMonth.getMonth() === currentActualMonth &&
            currentMonth.getFullYear() === currentActualYear
        );
    }, [currentMonth, currentActualMonth, currentActualYear]);

    // Filter attendance data based on the current month
    const filteredAttendanceData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth(); // 0-indexed month

        return attendanceData.filter(row => {
            const rowDate = new Date(row.date);
            return rowDate.getFullYear() === year && rowDate.getMonth() === month;
        });
    }, [currentMonth]); // Re-filter whenever currentMonth changes

    // Calculate summary based on filtered data
    const summary = useMemo(() => {
        return filteredAttendanceData.reduce(
            (acc, row) => {
                acc[row.status] = (acc[row.status] || 0) + 1;
                return acc;
            },
            {} as Record<StatusKey, number>
        );
    }, [filteredAttendanceData]); // Recalculate summary whenever filteredAttendanceData changes

    // Function to handle month change
    const handleMonthChange = (direction: 'prev' | 'next') => {
        setCurrentMonth(prevMonth => {
            const newMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth());
            if (direction === 'prev') {
                newMonth.setMonth(newMonth.getMonth() - 1);
            } else {
                newMonth.setMonth(newMonth.getMonth() + 1);
            }
            return newMonth;
        });
    };

    // Format current month for display
    const monthDisplayName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Function to handle row click and open modal
    const handleRowClick = (row: typeof attendanceData[0]) => {
        setSelectedRow(row); // Set the selected row data
        console.log(row)
        setModalVisible(true); // Then open the modal
    };

    // Function to handle modal close
    const handleModalClose = () => {
        setModalVisible(false); // Close the modal
        setSelectedRow(null);   // Clear the selected row data
    };

    // Function to handle modal submit
    const handleModalSubmit = (data: { inTime: string; outTime: string; status: string; reason: string }) => {
        console.log('Request submitted:', data);
        // You would typically send this data to your backend here
        handleModalClose(); // Close and clear after submission
    };

    return (
        <Stack flex={1} p="$2" mt="$5" bg="$background">
            {/* Month Navigation */}
            <XStack justify="space-between" alignItems="center" mb="$4">
                <Button
                    icon={<MaterialCommunityIcons name="chevron-left" size={24} />}
                    onPress={() => handleMonthChange('prev')}
                    circular
                />
                <Text fontWeight="bold" fontSize="$7">{monthDisplayName}</Text>
                <Button
                    icon={<MaterialCommunityIcons name="chevron-right" size={24} />}
                    onPress={() => handleMonthChange('next')}
                    circular
                    disabled={isNextButtonDisabled}
                    opacity={isNextButtonDisabled ? 0.5 : 1} // Optional: make it look disabled
                />
            </XStack>

            {/* Table Summary */}
            <YStack mb="$2">
                <Text fontWeight="bold">
                    This month:
                    <Text color="#34C759"> {summary.P || 0} Present</Text>,
                    <Text color="#FFD600"> {summary.L || 0} Late</Text>,
                    <Text color="#FF3B30"> {summary.A || 0} Absent</Text>,
                    <Text color="#007AFF"> {summary.CH || 0} Holiday</Text>
                </Text>
            </YStack>

            {/* Table Header */}
            <XStack bg="$color2" p="$3" br="$2" mb="$2" elevation={2}>
                <Text flex={1} fontWeight="bold" fontSize="$6">Date</Text>
                <Text flex={1} fontWeight="bold" fontSize="$6">Day</Text>
                <Text flex={1.2} fontWeight="bold" fontSize="$6">In</Text>
                <Text flex={1.2} fontWeight="bold" fontSize="$6">Out</Text>
                <Text flex={1} fontWeight="bold" fontSize="$6">Status</Text>
            </XStack>
            {/* Table Body */}
            <ScrollView>
                <YStack>
                    {filteredAttendanceData.map((row, idx) => (
                        <XStack
                            key={row.date}
                            bg={idx % 2 === 0 ? '$color1' : '$color2'}
                            p="$2"
                            br="$2"
                            ai="center"
                            mb="$1"
                            hoverStyle={{ bg: '$color3' }}
                            onPress={() => handleRowClick(row)}
                        >
                            <Text flex={1} fontSize="$5">{parseInt(row.date.split('-')[2], 10)}</Text>
                            <Text flex={1} fontSize="$5">{row.day}</Text>
                            <Text flex={1.2} fontSize="$5">{row.in}</Text>
                            <Text flex={1.2} fontSize="$5">{row.out}</Text>
                            <XStack flex={1} ai="center">
                                <MaterialCommunityIcons
                                    name={
                                        row.status === 'P' ? 'check-circle'
                                            : row.status === 'L' ? 'clock-alert'
                                                : row.status === 'A' ? 'close-circle'
                                                    : row.status === 'CH' ? 'logout'
                                                        : 'help-circle'
                                    }
                                    size={18}
                                    color={statusMap[row.status]?.color || '#B0B0B0'}
                                />
                                <Text
                                    ml="$1"
                                    color={statusMap[row.status]?.color || '#B0B0B0'}
                                    fontWeight="bold"
                                    fontSize="$5"
                                >
                                    {row.status}
                                </Text>
                            </XStack>
                        </XStack>
                    ))}

                    {modalVisible && selectedRow && (
                        <RequestChangeModal
                            visible={modalVisible}
                            onClose={handleModalClose}
                            date={selectedRow.date}
                            day={selectedRow.day}
                            inTime={selectedRow.in}
                            outTime={selectedRow.out}
                            status={selectedRow.status}
                            onSubmit={handleModalSubmit}
                        />
                    )}
                </YStack>
            </ScrollView>

            {/* Status Legend */}
            <YStack mt="$4">
                <Text fontWeight="bold" mb="$2">Status Legend:</Text>
                <XStack gap="$4" flexWrap="wrap">
                    {Object.entries(statusMap).map(([key, val]) => (
                        <XStack key={key} ai="center" gap="$1">
                            <MaterialCommunityIcons name={
                                key === 'P' ? 'check-circle'
                                    : key === 'L' ? 'clock-alert'
                                        : key === 'A' ? 'close-circle'
                                            : key === 'CH' ? 'logout'
                                                : 'help-circle'
                            } size={16} color={val.color}
                            />
                            <Text color={val.color} fontWeight="bold">{key}</Text>
                            <Text color="$color10" fontSize="$4">- {val.label}</Text>
                        </XStack>
                    ))}
                </XStack>
            </YStack>
        </Stack>
    );
}
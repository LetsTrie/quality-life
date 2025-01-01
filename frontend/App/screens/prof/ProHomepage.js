import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Text from '../../components/Text';
import { numOfNewNotificationsAction, storeProfessionalsProfile } from '../../redux/actions/prof';
import { useDispatch, useSelector } from 'react-redux';
import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { ApiDefinitions } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../config/colors';
import { useNavigation } from '@react-navigation/native';
import { setUnreadNotificationCount } from '../../redux/actions';
import { useIsFocused } from '@react-navigation/native';
import { ErrorButton } from '../../components';

const SCREEN_NAME = constants.PROF_HOMEPAGE;

const WarningBlock = () => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={styles.warningContainer}
            onPress={() => navigation.navigate(constants.SETTINGS)}
        >
            <Text style={styles.warningText}>
                Your account is hidden. No appointments can be booked. You can update your
                visibility in settings.
            </Text>
        </TouchableOpacity>
    );
};

const CardItem = ({ icon, title, subtitle, color, onPress, badge }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[
            styles.card,
            {
                borderWidth: 0.5,
                borderLeftWidth: 4,
                borderLeftColor: color,
                borderColor: color,
                transform: [{ translateX: 0 }],
                backgroundColor: colors.white,
            },
        ]}
    >
        <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
                <MaterialIcons name={icon} size={24} color={color} />
            </View>
            <View style={styles.cardTextContainer}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
                {subtitle && (
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {badge && (
                <View style={[styles.badge, { backgroundColor: color }]}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
        </View>
    </TouchableOpacity>
);

const Homepage = () => {
    const isFocused = useIsFocused();

    useBackPress(SCREEN_NAME);

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { ApiExecutor } = useHelper();

    const unreadNotificationCount = useSelector((state) => state.notifications.unreadCount);
    const { numOfNewClientRequests, prof = {} } = useSelector((state) => state.prof || {});

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    async function getAllInformations() {
        setIsLoading(true);
        setError(null);

        const nResponse = await ApiExecutor(
            ApiDefinitions.getProfessionalHomepageNotificationCount()
        );
        if (!nResponse.success) {
            setError(nResponse.error.message);
            return;
        }

        const pResponse = await ApiExecutor(ApiDefinitions.getProfessionalsProfile());
        if (!pResponse.success) {
            setError(pResponse.error.message);
            return;
        }

        dispatch(numOfNewNotificationsAction(parseFloat(nResponse.data.appointmentCount)));
        dispatch(setUnreadNotificationCount(parseFloat(nResponse.data.notificationCount)));
        dispatch(storeProfessionalsProfile(pResponse.data.prof));

        setIsLoading(false);
    }

    useEffect(() => {
        if (isLoading && error) setIsLoading(false);
    }, [error]);

    const anyNewNotifications = !(!unreadNotificationCount || unreadNotificationCount <= 0);

    const onRefresh = React.useCallback(() => {
        (async () => {
            setRefreshing(true);
            await getAllInformations();
            setRefreshing(false);
        })();
    }, []);

    useEffect(() => {
        if (!isFocused) return;

        (async () => {
            await getAllInformations();
        })();
    }, [isFocused]);

    if (!prof) return null;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <View style={styles.content}>
                    {error && <ErrorButton title={error} visible={!!error} />}

                    {anyNewNotifications && (
                        <CardItem
                            icon="notifications-active"
                            title="New Notifications"
                            subtitle={`You have ${unreadNotificationCount} new notifications`}
                            color={colors.highlight}
                            onPress={() => navigation.navigate(constants.NOTIFICATIONS)}
                        />
                    )}

                    {!prof.visibility && <WarningBlock />}

                    <CardItem
                        icon="person-add"
                        title="Client Requests"
                        badge={numOfNewClientRequests > 0 ? numOfNewClientRequests : null}
                        color={colors.danger}
                        onPress={() => navigation.navigate(constants.PROF_CLIENT_REQUEST)}
                    />

                    <CardItem
                        icon="group"
                        title="My Clients"
                        color="#337AB7"
                        onPress={() =>
                            navigation.navigate(constants.PROFESSIONALS_CLIENT, {
                                goToBack: SCREEN_NAME,
                            })
                        }
                    />

                    <CardItem
                        icon="assessment"
                        title="Assessment Tools"
                        color={colors.success}
                        onPress={() => navigation.navigate(constants.PROF_ASSESSMENT_TOOLS)}
                    />

                    {!anyNewNotifications && (
                        <CardItem
                            icon="notifications-active"
                            title="Notifications"
                            color="#FFC107"
                            onPress={() => navigation.navigate(constants.NOTIFICATIONS)}
                        />
                    )}

                    <CardItem
                        icon="verified-user"
                        title="My Profile"
                        color="#6F42C1"
                        onPress={() => navigation.navigate(constants.PROF_PROFILE)}
                    />
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
    },
    content: {
        paddingVertical: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    card: {
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 8,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingVertical: 14,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${colors.background}`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 14,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.light,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
        fontSize: 15,
        marginBottom: 16,
    },
    buttonContainer: {
        marginTop: 16,
        paddingHorizontal: 8,
    },
    signOutButton: {
        backgroundColor: colors.danger,
        borderRadius: 12,
        paddingVertical: 14,
    },
    warningContainer: {
        backgroundColor: '#FFE5E5',
        borderWidth: 1,
        borderColor: '#FF6B6B',
        borderRadius: 8,
        padding: 16,
        paddingVertical: 8,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    warningText: {
        color: '#D32F2F',
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
        textAlign: 'justify',
    },
});

export default Homepage;

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface Notification {
    _id: string;
    userId: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export const useNotifications = (userId: string | undefined) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const notifUrl = process.env.REACT_APP_URL_GATEWAY_NOTIFICATION ;
    const urlSocket = process.env.REACT_APP_NOTIFICATION_SOCKET_URL ;
    let socket: Socket | null = null;

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`${notifUrl}/${userId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.read).length);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(`${notifUrl}/${id}/read`);
            await fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!userId) return;
        
        fetchNotifications();
        
        socket = io(`${urlSocket}`, {
            auth: { userId }
        });
        
        socket.on('new-notification', (notif: Notification) => {
            setNotifications((prev) => [notif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });
        
        return () => {
            if (socket) socket.disconnect();
        };
    }, [userId]);

    return { notifications, unreadCount, markAsRead, fetchNotifications };
};
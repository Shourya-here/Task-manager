import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useSocket(projectId) {
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    // Connect to Socket.IO server
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('joinProject', projectId);
    });

    socket.on('taskCreated', (task) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(`New task added: ${task.title}`, { id: `task-create-${task.id}` });
    });

    socket.on('taskUpdated', (task) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      // Only show toast if the status changed to DONE or something notable
      if (task.status === 'DONE') {
        toast.success(`Task completed: ${task.title}`, { id: `task-done-${task.id}`, icon: '🎉' });
      }
    });

    socket.on('taskDeleted', ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast('A task was deleted', { id: `task-delete-${taskId}`, icon: '🗑️' });
    });

    return () => {
      if (socket.connected) {
        socket.emit('leaveProject', projectId);
        socket.disconnect();
      }
    };
  }, [projectId, queryClient]);

  return socketRef.current;
}

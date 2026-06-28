import { Actions, Bubble, Sender, type BubbleItemType, type BubbleListProps } from '@ant-design/x';
import { App, Avatar, message, type GetRef } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { AiOutlineAntDesign, AiOutlineCheck, AiOutlineClose, AiOutlineCopy, AiOutlineEdit, AiOutlineRedo, AiOutlineUser } from 'react-icons/ai';
import { io } from 'socket.io-client'
import chatSvc from '../../service/chat.service';
import { Controller, useForm } from 'react-hook-form';
import { useAppContext } from '../../context/AppContext';

const actionItems = [
    {
        key: 'retry',
        icon: <AiOutlineRedo />,
        label: 'Retry',
    },
    {
        key: 'copy',
        icon: <AiOutlineCopy />,
        label: 'Copy',
    },
];

function useBubbleList(initialItems: BubbleItemType[] = []) {
    const [items, setItems] = React.useState<BubbleItemType[]>(initialItems);

    const add = useCallback((item: BubbleItemType) => {
        setItems((prev) => [...prev, item]);
    }, []);

    const update = useCallback(
        (key: string | number, data: Omit<Partial<BubbleItemType>, 'key' | 'role'>) => {
            setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...data } : item)));
        },
        [],
    );

    return [items, setItems, add, update] as const;
}

const ViewMessageSingle = ({ conversationId, setViewMessage }: any) => {
    const [value, setValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [items, set, _add, update] = useBubbleList([]);
    const listRef = React.useRef<GetRef<typeof Bubble.List>>(null);
    const { loggedInUser } = useAppContext();

    const socket = React.useMemo(
        () => io('http://localhost:8001'),
        []
    );

    const getRoleFromMessage = (msg: any) => {
        const senderId =
            typeof msg.sender === 'string'
                ? msg.sender
                : msg.sender?._id;

        return senderId === loggedInUser?._id ? 'user' : 'ai';
    };

    const mapMessagesToBubbles = (messages: any[]) => {
        return messages.map((msg) => ({
            key: msg._id,
            role: getRoleFromMessage(msg),
            content: msg.text,
            typing: false,
        }));
    };

    const memoRole: BubbleListProps['role'] = React.useMemo(
        () => ({
            ai: {
                typing: true,
                header: `sender`,
                avatar: () => <Avatar icon={<AiOutlineAntDesign />} />,
                footer: (content) => <Actions items={actionItems} onClick={() => console.log(content)} />,
            },
            user: (data) => ({
                placement: 'end',
                typing: false,
                header: `Me`,
                avatar: () => <Avatar icon={<AiOutlineUser />} />,
                footer: () => (
                    <Actions
                        items={[
                            data.editable
                                ? { key: 'done', icon: <AiOutlineCheck />, label: 'Done' }
                                : { key: 'edit', icon: <AiOutlineEdit />, label: 'Edit' },
                        ]}
                        onClick={({ key }) => update(data.key, { editable: key === 'edit' })}
                    />
                ),
                onEditConfirm: (content) => {
                    update(data.key, { content, editable: false });
                },
                onEditCancel: () => update(data.key, { editable: false }),
            }),
        }),
        [],
    );

    const { control, handleSubmit } = useForm({
        defaultValues: {
            message: ''
        }
    })

    const { message: antdMessage } = App.useApp();

    // Mock send message
    React.useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
                message.success('Send message successfully!');
            }, 3000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [loading]);

    const submitSend = async ({ message: text }: { message: string }) => {
        if (!text || !conversationId) return;

        _add({
            key: Date.now(),
            role: 'user',
            content: text,
        });

        setValue('');

        if (loggedInUser) {
            await chatSvc.createMessage(
                loggedInUser?._id,
                conversationId,
                { message: text }
            );
        }

        socket.emit('send-message', {
            conversationId,
            text,
            sender: loggedInUser?._id,
        });
    };

    // Initial messages (optional)
    useEffect(() => {
        if (!conversationId) return;

        const loadMessages = async () => {
            try {
                const res = await chatSvc.getMessages(conversationId);
                console.log(res.data.data)
                const bubbles = mapMessagesToBubbles(res.data.data);
                set(bubbles);
            } catch (err) {
                message.error('Failed to load messages');
            }
        };

        loadMessages();
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;

        socket.emit('join-room', conversationId);

        socket.on('receive-message', (msg) => {
            _add({
                key: msg._id,
                role: getRoleFromMessage(msg),
                content: msg.text,
            });
        });

        return () => {
            socket.off('receive-message');
        };
    }, [conversationId]);

    useEffect(() => {
        socket.on("disconnect", () => {
            message.info('Disconnected');
        });

        return () => {
            socket.off("disconnect");
        };
    }, []);

    return (
        <div className='flex flex-col p-2 fixed bottom-10 right-10 z-90 bg-gray-50 rounded-md'>
            <div className='flex justify-between bg-blue-700/70 p-2 rounded-md'>
                <h1>Messages</h1>
                <AiOutlineClose onClick={() => setViewMessage(false)} className='text-xl lg:text-2xl cursor-pointer hover:text-red-600 hover:scale-120 duration-300' />
            </div>
            <div className='flex flex-col'>
                <Bubble.List ref={listRef} style={{ height: 300, width: 300 }} role={memoRole} items={items} />
                <form onSubmit={handleSubmit(submitSend)}>
                    <Controller
                        name="message"
                        control={control}
                        render={({ field }) => (
                            <Sender
                                {...field}
                                loading={loading}
                                value={value}
                                onChange={(v) => {
                                    setValue(v);
                                }}
                                onSubmit={() => submitSend({ message: value })}
                                onCancel={() => {
                                    setLoading(false);
                                    antdMessage.error('Cancel sending!');
                                }}
                                autoSize={{ minRows: 1, maxRows: 6 }}
                            />
                        )}
                    />
                </form>
            </div>
        </div>
    );
};

export default ViewMessageSingle
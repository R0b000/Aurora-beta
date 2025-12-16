import { Actions, Bubble, Sender, type BubbleItemType, type BubbleListProps } from '@ant-design/x';
import { App, Avatar, message as antdMessage, type GetRef } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { AiOutlineAntDesign, AiOutlineCheck, AiOutlineClose, AiOutlineCopy, AiOutlineEdit, AiOutlineRedo, AiOutlineUser } from 'react-icons/ai';
import type { ProductMessageProps } from '../ProductPage/ProductViewPage';
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

const MessagePage = ({ setMessageClick, productDetails }: ProductMessageProps) => {
    const [value, setValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [items, set, _add, update] = useBubbleList([]);
    const listRef = React.useRef<GetRef<typeof Bubble.List>>(null);
    const [connected, setConnected] = useState<boolean>(false)
    const { loggedInUser } = useAppContext();
    const [conversationId, setConversationId] = useState<string>();

    const socket = React.useMemo(() =>
        io('http://localhost:8001')
        , [])

    const memoRole: BubbleListProps['role'] = React.useMemo(
        () => ({
            ai: {
                typing: true,
                header: `${productDetails.seller.name}`,
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

    // Mock send message
    React.useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
                antdMessage.success('Send message successfully!');
            }, 3000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [loading]);

    const getRoleFromMessage = (msg: any) => {
        const senderId = 
            typeof msg.sender === 'string' 
            ? msg.sender : msg.sender?._id;

        return senderId === loggedInUser?._id ? "user" : 'ai'
    }

    const mapMessagesToBubbles = (messages: any[]) => {
        return messages.map((msg) => ({
            key: msg._id,
            role: getRoleFromMessage(msg),
            content: msg.text,
            typing: false,
        }));
    };

    const createRoom = async (id: string) => {
        try {
            const response = await chatSvc.createRoom(id)

            let conversationId = response.data.data._id

            socket.emit('join-room', (conversationId))

            socket.on('joined-room', (conversationId) => {
                antdMessage.info(`Connected!`);
                setConnected(true)
                setConversationId(conversationId)
            })

            const roomMessages = await chatSvc.getMessages(conversationId)
            const bubbles = mapMessagesToBubbles(roomMessages.data.data)
            set(bubbles)
        } catch (error) {
            antdMessage.error('Failed to load messages.')
        }
    }

    const submitSend = async (data: { message: string }) => {
        if (!connected) {
            antdMessage.warning('Connecting...')
        }
        setLoading(true)

        let text = data.message
        console.log(text)

        if (loggedInUser && conversationId) {
            await chatSvc.createMessage(loggedInUser?._id, conversationId, data)
        }

        if (!data.message || !conversationId) return;

        _add({
            key: Date.now(), 
            role: 'user',
            content: text
        })

        setValue('');

        if(loggedInUser) {
            await chatSvc.createMessage(loggedInUser?._id, conversationId, {message: text})
        }

        socket.emit('send-message', {
            conversationId, 
            text, 
            sender: loggedInUser?._id
        })
    }

    useEffect(() => {
        createRoom(productDetails.seller._id)
    }, [productDetails])

    useEffect(() => {
        if(!conversationId) return; 

        socket.on('receive-message', (msg) => {
            _add({
                key: msg._id,
                role: getRoleFromMessage(msg),
                content: msg.text,
            });
        })

        return () => {
            socket.off('receive-message');
        };
    }, [conversationId])

    useEffect(() => {
        socket.on("disconnect", () => {
            antdMessage.info('Disconnected');
        });

        return () => {
            socket.off("disconnect");
        };
    }, []);

    return (
        <div className='flex flex-col p-2 w-full'>
            <div className='flex justify-between bg-blue-700/70 p-2 rounded-md'>
                <h2>
                    {productDetails.seller.name}
                </h2>
                <AiOutlineClose onClick={() => setMessageClick(false)} className='text-xl lg:text-2xl cursor-pointer hover:text-red-600 hover:scale-120 duration-300' />
            </div>
            <div className='flex flex-col'>
                <Bubble.List ref={listRef} style={{ height: 300, width: 300, overflowY: 'auto' }} role={memoRole} items={items} />
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

export default MessagePage
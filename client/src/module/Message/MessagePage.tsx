import { Actions, Bubble, Sender, type BubbleItemType, type BubbleListProps } from '@ant-design/x';
import { App, Avatar, message, type GetRef } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { AiOutlineAntDesign, AiOutlineCheck, AiOutlineClose, AiOutlineCopy, AiOutlineEdit, AiOutlineRedo, AiOutlineUser } from 'react-icons/ai';
import type { ProductMessageProps } from '../ProductPage/ProductViewPage';
import { io } from 'socket.io-client'
import chatSvc from '../../service/chat.service';

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

let id = 0;
const getKey = () => `bubble_${id++}`;

const genItem = (isAI: boolean, config?: Partial<BubbleItemType>): BubbleItemType => {
    return {
        key: getKey(),
        role: isAI ? 'ai' : 'user',
        content: isAI ? 'AI response...' : 'User message...',
        ...config,
    };
};

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

    const socket = io('http://localhost:8001');

    console.log(productDetails)

    socket.on('connect', () => {
        console.log(socket.id)
    })

    socket.on("disconnect", () => {
        console.log(socket.id);
        message.info('Disconnected')
    });

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

    // Initial messages (optional)
    useEffect(() => {
        set([
            genItem(false, { typing: false }),
            genItem(true, { typing: false }),
        ]);
    }, []);

    const { message: antdMessage } = App.useApp();

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

    const createRoom = async (id: string) => {
        await chatSvc.createRoom(id)
    }

    useEffect(() => {
        createRoom(productDetails.seller._id)
    }, [productDetails])

    return (
        <div className='flex flex-col p-2 w-full'>
            <div className='flex justify-between bg-blue-700/70 p-2 rounded-md'>
                <h2>
                    {productDetails.seller.name}
                </h2>
                <AiOutlineClose onClick={() => setMessageClick(false)} className='text-xl lg:text-2xl cursor-pointer hover:text-red-600 hover:scale-120 duration-300' />
            </div>
            <div className='flex flex-col'>
                <Bubble.List ref={listRef} style={{ height: 300, width: 300 }} role={memoRole} items={items} />
                <Sender
                    loading={loading}
                    value={value}
                    onChange={(v) => {
                        setValue(v);
                    }}
                    onSubmit={() => {
                        setValue('');
                        setLoading(true);
                        antdMessage.info('Send message!');
                    }}
                    onCancel={() => {
                        setLoading(false);
                        antdMessage.error('Cancel sending!');
                    }}
                    autoSize={{ minRows: 1, maxRows: 6 }}
                />
            </div>
        </div>
    );
};

export default MessagePage
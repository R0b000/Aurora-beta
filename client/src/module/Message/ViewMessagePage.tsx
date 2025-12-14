import { useCallback, useEffect, useState } from "react"
import chatSvc from "../../service/chat.service"
import { Dropdown, type MenuProps } from "antd"

const ViewMessagePage = () => {
    const [messageList, setMessageList] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchMessageList = useCallback(async () => {
        try {
            const response = await chatSvc.listMessage();
            setMessageList(response)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    const items: MenuProps['items'] = [
        {
            key: '1',
            type: 'group',
            label: 'kjljlj',
            children: [
                {
                    key: '1-1',
                    label: '1st menu item',
                },
            ],
        },
    ];

    useEffect(() => {
        fetchMessageList();
    }, [])

    console.log(messageList)

    return (
        !isLoading &&
        <div className="flex w-full">
            <Dropdown menu={{ items }} open={true}  />
        </div>
    )
}

export default ViewMessagePage
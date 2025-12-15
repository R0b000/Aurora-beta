import { useCallback, useEffect, useState } from "react"
import chatSvc from "../../service/chat.service"
import { Empty } from "antd"
import { AiOutlineUser } from "react-icons/ai"
import ViewSingleMessagePage from "./ViewMessageSingle"
import { useAppContext } from "../../context/AppContext"

const ViewMessagePage = () => {
    const [messageList, setMessageList] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [viewMessage, setViewMessage] = useState<boolean>(false)
    const {loggedInUser} = useAppContext();
    const [conversationId, setConversationId] = useState<string | null>(null)

    const fetchMessageList = useCallback(async () => {
        try {
            const response = await chatSvc.listMessage();
            setMessageList(response.data)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMessageList();
    }, [])

    const handleMessageClick = (id:string) => {
        setViewMessage(true)
        setConversationId(id)
    }

    const getSender = (members: any[]) => {
        return members.find(
            (member) => member.email !== loggedInUser?.email
        )
    }

    console.log(messageList)

    return (
        !isLoading &&
        <div className="flex flex-col">
            <div className="hidden md:block w-full h-full items-center justify-end">
                <div className="flex flex-col md:w-[35vw] lg:w-[23vw] h-auto rounded-md bg-teal-200/70 shrink-0 z-50 absolute md:top-20 lg:top-14 right-5 p-2">
                    {messageList.data.conversation.length > 0 ? (
                        <div className="flex flex-col w-full h-full">
                            {messageList.data.conversation.map((conversation: any) => {
                                const sender = getSender(conversation.members)

                                return (
                                    <div
                                        key={conversation._id}
                                        onClick={() => handleMessageClick(conversation._id)}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex w-full items-center gap-2 p-2">
                                            <div className="flex w-10">
                                                {sender?.avatar ? (
                                                    <img
                                                        src={sender.avatar.optimizedUrl}
                                                        alt="profile"
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <AiOutlineUser className="text-2xl" />
                                                )}
                                            </div>

                                            <div className="flex flex-col flex-1">
                                                <h2 className="font-medium">
                                                    {sender?.name}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <Empty />
                    )}
                </div>
            </div>

            {viewMessage &&
                <ViewSingleMessagePage setViewMessage={setViewMessage} messageList={messageList} conversationId={conversationId}/>
            }
        </div>
    )
}

export default ViewMessagePage
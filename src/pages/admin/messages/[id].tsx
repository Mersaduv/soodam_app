import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NextPage } from 'next'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layouts'
import { LuCheckCheck } from 'react-icons/lu'
import { CheckReadIcon, Phone22Icon } from '@/icons'
import { BsTelephone } from 'react-icons/bs'
import { FaArrowLeft } from 'react-icons/fa'

type Message = {
  id: string
  senderId: string
  receiverId: string
  text: string
  timestamp: string
  status: string
  isRead: boolean
}

type Participant = {
  id: string
  fullName: string
  role: string
  phoneNumber: string
  image: string | null
  lastSeen: string
  isOnline: boolean
  cityTitle: string
}

type ConversationDetail = {
  id: string
  participants: Participant[]
  messages: Message[]
}

// Add mock data directly in the component for fallback
const MOCK_CONVERSATION_DETAILS = {
  id: '1',
  participants: [
    {
      id: '1',
      fullName: 'ادمین',
      role: 'admin',
      phoneNumber: '09334004040',
      image: null,
      lastSeen: new Date().toISOString(),
      isOnline: true,
      cityTitle: 'ادمین شهر بجنورد',
    },
    {
      id: '2',
      fullName: 'محمد شادلو',
      role: 'user',
      phoneNumber: '09123456789',
      image: null,
      lastSeen: new Date(Date.now() - 30 * 60000).toISOString(),
      isOnline: false,
      cityTitle: 'ادمین شهر مشهد',
    },
  ],
  messages: [
    {
      id: '1',
      senderId: '2',
      receiverId: '1',
      text: 'سلام وقتتون بخیر، به مدیری بود. خواستم بپرسم درباره آگهی که به تازگی ثبت شده منطقه سجاد مشهد',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'delivered',
      isRead: true,
    },
    {
      id: '2',
      senderId: '1',
      receiverId: '2',
      text: 'سلام ادمین محترم!',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      status: 'delivered',
      isRead: true,
    },
    {
      id: '3',
      senderId: '2',
      receiverId: '1',
      text: 'که اطلاعات مالک با مشخصات ارسال‌کننده نمی‌خونه. میشه کمک کنم تماس بگیرم یا مستقیم روش کنم؟',
      timestamp: new Date(Date.now() - 3400000).toISOString(),
      status: 'delivered',
      isRead: true,
    },
    {
      id: '4',
      senderId: '1',
      receiverId: '2',
      text: 'اگر اطلاعات زیاد هست و مطمئن نیستی، حتما تماس بگیر. در صورت عدم پاسخ یا ابهام زیاد، روش کن و دلیل رو هم ذکر کن لطفا',
      timestamp: new Date(Date.now() - 3300000).toISOString(),
      status: 'delivered',
      isRead: true,
    },
    {
      id: '5',
      senderId: '2',
      receiverId: '1',
      text: 'تشکر از همکاریتون.',
      timestamp: new Date(Date.now() - 3200000).toISOString(),
      status: 'delivered',
      isRead: true,
    },
  ],
}

const ConversationDetailPage: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Fetch conversation detail when the component mounts
  useEffect(() => {
    if (!id) return

    const fetchConversationDetail = async () => {
      try {
        const response = await fetch(`/api/admin/messages/${id}`)
        const data = await response.json()

        if (data.success && data.data && data.data.conversation) {
          setConversationDetail(data.data.conversation)
        } else if (id === '1') {
          // Fallback to mock data if API failed for conversation 1
          setConversationDetail(MOCK_CONVERSATION_DETAILS)
        }
      } catch (error) {
        console.error('Error fetching conversation detail:', error)
        // Use mock conversation detail if API failed and ID is 1
        if (id === '1') {
          setConversationDetail(MOCK_CONVERSATION_DETAILS)
        }
      } finally {
        setLoading(false)
      }
    }

    // Set a timeout to ensure we show something even if API is slow
    const timeoutId = setTimeout(() => {
      if (loading && id === '1') {
        setConversationDetail(MOCK_CONVERSATION_DETAILS)
        setLoading(false)
      }
    }, 2000)

    fetchConversationDetail()

    // Clear timeout on cleanup
    return () => clearTimeout(timeoutId)
  }, [id, loading])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversationDetail?.messages])

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !id || sendingMessage) return

    setSendingMessage(true)

    // Create a new message object directly
    const newMessageObj = {
      id: (conversationDetail?.messages.length ?? 0 + 1).toString(),
      senderId: '1',
      receiverId: conversationDetail?.participants.find((p) => p.id !== '1')?.id ?? '2',
      text: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isRead: false,
    }

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newMessage }),
      })

      const data = await response.json()

      if (data.success) {
        // Update conversation detail with new message from API
        setConversationDetail((prev) => {
          if (!prev) return null

          return {
            ...prev,
            messages: [...prev.messages, data.data.message],
          }
        })
      } else {
        // Use mock data if API call failed
        setConversationDetail((prev) => {
          if (!prev) return null

          return {
            ...prev,
            messages: [...prev.messages, newMessageObj],
          }
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)

      // Fall back to updating UI directly with mock data
      setConversationDetail((prev) => {
        if (!prev) return null

        return {
          ...prev,
          messages: [...prev.messages, newMessageObj],
        }
      })
    } finally {
      setNewMessage('')
      setSendingMessage(false)
    }
  }

  // Format timestamp to readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
  }

  // Format date based on how recent it is
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    const time = formatTime(timestamp)

    if (diffDays === 0) {
      return time // Today, just show time
    } else if (diffDays === 1) {
      return `دیروز ${time}`
    } else if (diffDays < 7) {
      // Get day name in Persian
      const dayName = date.toLocaleDateString('fa-IR', { weekday: 'long' })
      return `${dayName} ${time}`
    } else {
      return `${diffDays} روز پیش ${time}`
    }
  }

  // Prepare profile component only when conversationDetail exists
  const chatProfile = conversationDetail ? (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        {conversationDetail.participants.find((p) => p.id !== '1')?.image ? (
          <Image
            src={conversationDetail.participants.find((p) => p.id !== '1')?.image || ''}
            alt={conversationDetail.participants.find((p) => p.id !== '1')?.fullName || ''}
            width={40}
            height={40}
            className="rounded-full object-cover min-w-[42px] min-h-[42px]"
          />
        ) : (
          <div className="min-w-[42px] min-h-[42px] rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            {conversationDetail.participants.find((p) => p.id !== '1')?.fullName.charAt(0)}
          </div>
        )}
        <div className="mr-3">
          <div className="font-medium text-gray-800">
            {conversationDetail.participants.find((p) => p.id !== '1')?.fullName}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            {conversationDetail.participants.find((p) => p.id !== '1')?.isOnline ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full ml-1"></span> آنلاین
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-gray-400 rounded-full ml-1"></span>
                آخرین بازدید: {formatDate(conversationDetail.participants.find((p) => p.id !== '1')?.lastSeen || '')}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <Head>
        <title>سودم | گفتگو</title>
      </Head>

      <DashboardLayout
        showDetail
        title="گفتگو"
        profile={chatProfile}
        headerButton={
          <div>
            <Phone22Icon width="26px" height="26px" />
          </div>
        }
        chatRoomBg
      >
        <main className="h-screen w-full">
          {loading ? (
            <div className="flex justify-center items-center h-full pt-20">
              <div className="spinner"></div>
            </div>
          ) : conversationDetail ? (
            <div className="flex flex-col h-full">
              {/* Chat container with proper spacing for header and input */}
              <div className="flex flex-col h-full relative pt-[70px] pb-[76px]">
                {/* Messages container with scrolling */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-2" dir="ltr">
                  <div className="space-y-4">
                    {conversationDetail.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === '1' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          dir="rtl"
                          className={`max-w-[70%] md:max-w-[60%] rounded-2xl p-4 ${
                            message.senderId === '1'
                              ? 'bg-[#2C3E50] text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                          }`}
                        >
                          <p
                            className={`text-sm font-normal ${
                              message.senderId === '1' ? 'text-white' : 'text-gray-800'
                            }`}
                          >
                            {message.text}
                          </p>
                          <div
                            dir="ltr"
                            className={`text-[10px] mt-1 flex items-center justify-end farsi-digits ${
                              message.senderId === '1' ? 'text-gray-300' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                            {message.senderId === '1' && (
                              <span className="ml-1">
                                {message.isRead ? (
                                  <CheckReadIcon width="14px" height="14px" />
                                ) : (
                                  <CheckReadIcon width="14px" height="14px" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input - fixed at bottom with proper positioning */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-gray-50 p-3">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      placeholder="پیام خود را بنویسید..."
                      className="flex-1 p-2 min-h-[48px] mx-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      className="w-[48px] h-[48px] rounded-full bg-[#2C3E50] text-white hover:bg-[#1a3c5e] flex-shrink-0 disabled:bg-gray-300 flex items-center justify-center"
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      <FaArrowLeft className="text-2xl" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full pt-20 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-lg">گفتگو یافت نشد</p>
              <Link href="/admin/messages" className="mt-4 text-blue-500 hover:underline">
                بازگشت به لیست گفتگوها
              </Link>
            </div>
          )}
        </main>
      </DashboardLayout>

      <style jsx>{`
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #3498db;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}

export default dynamic(() => Promise.resolve(ConversationDetailPage), { ssr: false })

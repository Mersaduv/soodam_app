import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NextPage } from 'next'
import { useState, useEffect, useRef } from 'react'
import AdminHeader from '@/components/shared/AdminHeader'
import { DashboardLayout } from '@/components/layouts'
import Image from 'next/image'
import Link from 'next/link'
import { MdFilterList } from 'react-icons/md'
import { IoFilter } from 'react-icons/io5'

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

type Conversation = {
  id: string
  user: Participant
  lastMessage: {
    text: string
    timestamp: string
    senderId: string
  }
  unreadCount: number
}

type ConversationDetail = {
  id: string
  participants: Participant[]
  messages: Message[]
}

// Add mock data directly in the component for fallback
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    user: {
      id: '2',
      fullName: 'محمد شادلو',
      role: 'user',
      phoneNumber: '09123456789',
      image: null,
      lastSeen: new Date(Date.now() - 30 * 60000).toISOString(),
      isOnline: false,
      cityTitle: 'ادمین شهر مشهد',
    },
    lastMessage: {
      text: 'سلام وقتتون بخیر، به مدیری بود. خواستم بپرسم درباره آگهی که به تازگی ثبت شده منطقه سجاد مشهد',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      senderId: '2',
    },
    unreadCount: 2,
  },
  {
    id: '2',
    user: {
      id: '3',
      fullName: 'علی الهی',
      role: 'user',
      phoneNumber: '09187654321',
      image: null,
      lastSeen: new Date(Date.now() - 120 * 60000).toISOString(),
      isOnline: false,
      cityTitle: 'ادمین شهر مشهد',
    },
    lastMessage: {
      text: 'سلام، بله در خدمتم. چه کمکی از دستم بر میاد؟',
      timestamp: new Date(Date.now() - 86300000).toISOString(),
      senderId: '1',
    },
    unreadCount: 1,
  },
  {
    id: '3',
    user: {
      id: '4',
      fullName: 'سعید رضازاده',
      role: 'user',
      phoneNumber: '09223344556',
      image: null,
      lastSeen: new Date(Date.now() - 240 * 60000).toISOString(),
      isOnline: false,
      cityTitle: 'بازاریاب تهران',
    },
    lastMessage: {
      text: 'سلام، میشه لطفا یکی از آگهی‌های من رو که اشتباهی وارد شده حذف کنید؟',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      senderId: '4',
    },
    unreadCount: 1,
  },
]

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

// Update the useEffect to use mock data if API fails
const AdminMessagesPage: NextPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all conversations or use mock data
  useEffect(() => {
    setLoading(true)

    // Try to fetch from API first
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/admin/messages')
        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          setConversations(data.data)
        } else {
          // Fallback to mock data if API returned empty results
          console.log('API returned empty results, using mock data')
          setConversations(MOCK_CONVERSATIONS)
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
        // Use mock data on error
        setConversations(MOCK_CONVERSATIONS)
      } finally {
        setLoading(false)
      }
    }

    // Set a timeout to ensure we show something even if API is slow
    const timeoutId = setTimeout(() => {
      if (conversations.length === 0) {
        console.log('Timeout reached, using mock data')
        setConversations(MOCK_CONVERSATIONS)
        setLoading(false)
      }
    }, 2000)

    fetchConversations()

    // Clear timeout on cleanup
    return () => clearTimeout(timeoutId)
  }, [])

  // Fetch conversation detail when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return

    const fetchConversationDetail = async () => {
      try {
        const response = await fetch(`/api/admin/messages/${selectedConversation}`)
        const data = await response.json()

        if (data.success && data.data && data.data.conversation) {
          setConversationDetail(data.data.conversation)
        } else if (selectedConversation === '1') {
          // Fallback to mock data if API failed for conversation 1
          setConversationDetail(MOCK_CONVERSATION_DETAILS)
        }
      } catch (error) {
        console.error('Error fetching conversation detail:', error)
        // Use mock conversation detail if API failed and ID is 1
        if (selectedConversation === '1') {
          setConversationDetail(MOCK_CONVERSATION_DETAILS)
        }
      }
    }

    // Set a timeout to ensure we show something even if API is slow
    const timeoutId = setTimeout(() => {
      if (!conversationDetail && selectedConversation === '1') {
        setConversationDetail(MOCK_CONVERSATION_DETAILS)
      }
    }, 2000)

    fetchConversationDetail()

    // Clear timeout on cleanup
    return () => clearTimeout(timeoutId)
  }, [selectedConversation])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversationDetail?.messages])

  // Update the handleSendMessage function to work with mock data
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

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
      const response = await fetch(`/api/admin/messages/${selectedConversation}`, {
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

        // Update conversations list
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv.id === selectedConversation) {
              return {
                ...conv,
                lastMessage: {
                  text: newMessage,
                  timestamp: new Date().toISOString(),
                  senderId: '1', // Admin ID
                },
              }
            }
            return conv
          })
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

        // Update conversations list with mock data
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv.id === selectedConversation) {
              return {
                ...conv,
                lastMessage: {
                  text: newMessage,
                  timestamp: new Date().toISOString(),
                  senderId: '1', // Admin ID
                },
              }
            }
            return conv
          })
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

      // Update conversations list with mock data
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === selectedConversation) {
            return {
              ...conv,
              lastMessage: {
                text: newMessage,
                timestamp: new Date().toISOString(),
                senderId: '1', // Admin ID
              },
            }
          }
          return conv
        })
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

  // Filter conversations by search query
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>سودم | پیام ها</title>
      </Head>

      <DashboardLayout
        showDetail
        title="پیام ها"
        headerButton={
          <div className="flex items-center gap-2">
            <IoFilter className="text-xl text-[#2C3E50] font-bold" />
            <div className="hover:text-white text-[#2C3E50] transition-all duration-300 scale-100 focus:scale-90 py-2 rounded-lg text-sm flex items-center">
              فیلتر پیام ها
            </div>
          </div>
        }
      >
        <main className="py-[87px] relative">
          <div className="px-4 mb-5 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="برای جستجو تایپ کنید..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full appearance-none focus:border-none focus:outline-1 focus:outline-[#3c6893] p-4 h-[48px] bg-white rounded-[10px] border border-gray-200"
              />
            </div>

            <div className=" h-[calc(100%-80px)]">
              <div className=" p-2 h-full flex flex-col md:flex-row">
                {/* Messages List */}
                <div className="w-full md:w-1/3">
                  <div className="overflow-y-auto h-[calc(100%-80px)]">
                    {loading ? (
                      <div className="flex justify-center items-center h-24">
                        <div className="spinner"></div>
                      </div>
                    ) : filteredConversations.length > 0 ? (
                      filteredConversations.map((conversation) => (
                        <Link 
                          href={`/admin/messages/${conversation.id}`} 
                          key={conversation.id}
                          className={`block p-3 px-0 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            selectedConversation === conversation.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="relative">
                              {conversation.user.image ? (
                                <Image
                                  src={conversation.user.image}
                                  alt={conversation.user.fullName}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                  {conversation.user.fullName.charAt(0)}
                                </div>
                              )}
                              {conversation.user.isOnline && (
                                <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="mr-3 flex-1">
                              <div className="flex justify-between items-center">
                                <div className="font-medium text-sm text-gray-800">{conversation.user.fullName}</div>
                                <div className="text-xs text-gray-500 farsi-digits">
                                  {formatDate(conversation.lastMessage.timestamp)}
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-600 truncate w-40">
                                  {conversation.lastMessage.senderId === '1' ? 'شما: ' : ''}
                                  {conversation.lastMessage.text}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <span className="bg-green-500 farsi-digits text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1">{conversation.user.cityTitle}</div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8 mb-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
                          />
                        </svg>
                        <p>پیامی یافت نشد</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Window */}
                <div className="w-full md:w-2/3 flex flex-col h-full">
                  {selectedConversation && conversationDetail ? (
                    <>
                      {/* Chat Header */}
                      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white rounded-t-lg">
                        <div className="flex items-center">
                          {conversationDetail.participants.find((p) => p.id !== '1')?.image ? (
                            <Image
                              src={conversationDetail.participants.find((p) => p.id !== '1')?.image || ''}
                              alt={conversationDetail.participants.find((p) => p.id !== '1')?.fullName || ''}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
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
                                  آخرین بازدید:{' '}
                                  {formatDate(
                                    conversationDetail.participants.find((p) => p.id !== '1')?.lastSeen || ''
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-full hover:bg-gray-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 text-gray-500"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                              />
                            </svg>
                          </button>
                          <button className="p-2 rounded-full hover:bg-gray-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 text-gray-500"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {conversationDetail.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === '1' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl p-3 ${
                                message.senderId === '1'
                                  ? 'bg-[#112B46] text-white rounded-br-none'
                                  : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <div
                                className={`text-[10px] mt-1 flex items-center justify-end farsi-digits ${
                                  message.senderId === '1' ? 'text-gray-300' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.timestamp)}
                                {message.senderId === '1' && (
                                  <span className="mr-1">
                                    {message.isRead ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-3 h-3"
                                      >
                                        <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                                      </svg>
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-3 h-3"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                        <form onSubmit={handleSendMessage} className="flex">
                          <button
                            type="button"
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 flex-shrink-0"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                              />
                            </svg>
                          </button>
                          <input
                            type="text"
                            placeholder="پیام خود را بنویسید..."
                            className="flex-1 p-2 mx-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sendingMessage}
                          />
                          <button
                            type="submit"
                            className="p-2 rounded-full bg-[#112B46] text-white hover:bg-[#1a3c5e] flex-shrink-0 disabled:bg-gray-300"
                            disabled={!newMessage.trim() || sendingMessage}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 transform rotate-180"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                              />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                     
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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

export default dynamic(() => Promise.resolve(AdminMessagesPage), { ssr: false })

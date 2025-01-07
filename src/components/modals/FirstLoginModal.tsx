import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Modal } from '../ui';

interface FirstLoginModalProps {
  isShow: boolean;
  onClose: () => void;
}

const FirstLoginModal: React.FC<FirstLoginModalProps> = ({ isShow, onClose }) => {
  return (
    <Modal isShow={isShow} onClose={onClose} effect="ease-out">
      <Modal.Content
        onClose={onClose}
        className="flex h-full flex-col gap-y-5 bg-white mx-2 p-4 rounded-3xl"
      >
        <Modal.Header onClose={onClose}>کانال‌های ورودی</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Link
              href={{
                pathname: '/authentication/login',
                query: { role: 'MemberUser' }, // اطمینان حاصل کنید که `roles.MemberUser` در دسترس است
              }}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ورود به عنوان کاربر عضو</p>
                <button className="text-white bg-[#D52133] w-full text-xs py-1 rounded-lg mt-2">
                  خرید اشتراک
                </button>
              </div>
              <Image
                src="/static/listening-to-feedback.png"
                alt="عضو"
                layout="intrinsic"
                width={95}
                height={95}
              />
            </Link>

            <Link
              href={{
                pathname: '/',
                query: { role: 'User' },
              }}
              onClick={onClose}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ورود به عنوان کاربر معمولی</p>
              </div>
              <Image
                src="/static/smart-home-contol.png"
                alt="کاربر معمولی"
                layout="intrinsic"
                width={95}
                height={95}
              />
            </Link>

            <Link
              href={{
                pathname: '/authentication/login',
                query: { role: 'Marketer' },
              }}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ورود به عنوان بازاریاب</p>
              </div>
              <Image
                src="/static/becoming-rich.png"
                alt="بازاریاب"
                layout="intrinsic"
                width={95}
                height={95}
              />
            </Link>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default FirstLoginModal;

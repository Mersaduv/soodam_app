import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Home2Icon, MoreIcon, ProfileTick, SearchIcon, SquareTaskIcon } from "@/icons";

const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const { pathname } = router;

  const navItems = [
    { href: "/", icon: <SearchIcon />, label: "جستجو" },
    { href: "/myCity", icon: <Home2Icon />, label: "شهر من" },
    { href: "/requests", icon: <SquareTaskIcon />, label: "درخواست‌ها" },
    { href: "/memberShip", icon: <ProfileTick />, label: "عضویت" },
    { href: "/soodam", icon: <MoreIcon />, label: "سودم" },
  ];

  return (
    <nav className="fixed z-[999] bottom-0 left-0 right-0 bg-white shadow-nav border-t border-gray-200 h-[68px] flex items-start w-full">
      <ul className="flex flex-row-reverse justify-between items-start px-5 w-full">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={`flex flex-col pt-2.5 px-1 items-center border-t-[3px] ${pathname === item.href ? " border-[#D52133]":" border-white"}`} passHref>
              <div className="flex flex-col items-center">
                {React.cloneElement(item.icon, {
                  className: `text-xl ${
                    pathname === item.href ? "text-[#D52133]" : "text-gray-600"
                  }`,
                })}
                <span
                  className={`text-[10px] font-bold pt-1 ${
                    pathname === item.href ? "text-[#D52133]" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNavigation;

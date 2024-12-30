import { useRouter } from 'next/router'

import { sorts } from '@/utils'

import { Check, HomeIcon, Sort as SortIcon } from '@/icons'

import { useChangeRoute, useDisclosure } from '@/hooks'

import { Modal } from '@/components/ui'
import { useState, useRef } from 'react'

interface Props {}
const FilterControlNavBar: React.FC = () => {
  // ? Assets
  const { query, push } = useRouter();
  const type = query?.type?.toString() ?? "";
  const pageQuery = Number(query?.page);
  const changeRoute = useChangeRoute();

  // ? State
  const [activeType, setActiveType] = useState<string>(type);

  // ? Handlers
  const handleChange = (item: string) => {
    const newType = activeType === item ? "" : item;
    setActiveType(newType);
    changeRoute({
      page: pageQuery && pageQuery > 1 ? 1 : "",
      type: newType,
    });
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    let startX = e.pageX - container.offsetLeft;
    let scrollLeft = container.scrollLeft;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - container.offsetLeft;
      const walk = (x - startX) * 1; // سرعت اسکرول
      container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleNavigate = () => {
    push('/filterControls');
  };

  // ? Render(s)
  return (
    <div ref={containerRef}
    className="flex gap-x-2 hide-scrollbar cursor-grab"
    onMouseDown={handleMouseDown}>
      <div onClick={handleNavigate} className="w-fit cursor-pointer whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A]">
        فیلتر ها
      </div>
      <div
        onClick={() => handleChange("sale")}
        className={`cursor-pointer w-fit my-[12px] flex-center gap-1 px-4 font-normal text-sm border rounded-[59px] h-[40px] ${
          activeType === "sale"
            ? "bg-[#D52133] text-white"
            : "text-[#D52133]"
        }`}
      >
        <HomeIcon width='16px' height='16px' />
        <span
          className={`font-normal whitespace-nowrap text-[16px] text-[#7A7A7A] ${
            activeType === "sale" ? "text-white" : ""
          }`}
        >
          فروش
        </span>
      </div>
      <div
        onClick={() => handleChange("rent")}
        className={`cursor-pointer w-fit my-[12px] flex-center gap-1 px-4 font-normal text-sm border rounded-[59px] h-[40px] ${
          activeType === "rent"
            ? "bg-[#D52133] text-white"
            : "text-[#D52133]"
        }`}
      >
        <HomeIcon width='16px' height='16px'/>
        <span
          className={`font-normal whitespace-nowrap text-[16px] text-[#7A7A7A] ${
            activeType === "rent" ? "text-white" : ""
          }`}
        >
          رهن و اجاره
        </span>
      </div>
      <div className="w-fit whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A] cursor-pointer">
        نوع ملک
      </div>
      <div className="w-fit whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A] cursor-pointer">
        قیمت
      </div>
      <div className="w-fit whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A] cursor-pointer">
        اتاق خواب
      </div>
      <div className="w-fit whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A] cursor-pointer">
        متراژ
      </div>
    </div>
  );
};

export default FilterControlNavBar;

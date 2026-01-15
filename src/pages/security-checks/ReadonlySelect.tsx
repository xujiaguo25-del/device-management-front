import React, { useState } from 'react';
import { Select, } from 'antd';

interface ReadonlySelectProps {
  value: string;
  options: { label: string; value: string }[];
}

const ReadonlySelect: React.FC<ReadonlySelectProps> = ({ value, options }) => {
  const [open, setOpen] = useState(false);

  return (
    <Select
      style={{ width: '100%' }}
      value={value}
      options={options}

      /* 控制下拉显隐 */
      open={open}
      onOpenChange={setOpen}

      optionRender={(option) => (
        <div
          onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
        }}
         >
        {option.label}
     </div>
)}

      /* 不允许输入 */
      showSearch={false}
      allowClear={false}
      popupMatchSelectWidth
    />
  );
};

export default ReadonlySelect;

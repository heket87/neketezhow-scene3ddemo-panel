import { Collapse } from "@grafana/ui";
import React, { FC, PropsWithChildren,   } from "react";

export const CollapsElement: FC<PropsWithChildren<{  label: any}>> = ({
 
    children,
    label,
  }) => {
   
    const [is_open, setOpen] = React.useState(false)

   
  
    return (
      <Collapse label={label}
      collapsible
      isOpen={is_open}
      onToggle={()=>setOpen(!is_open)}
   
      >
     
          {children}
       
      </Collapse>
    );
  };

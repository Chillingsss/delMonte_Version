import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useState } from 'react';
import { storeData } from '../utils/storageUtils';

function SubscribeToEmail() {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    const newValue = isChecked ? 0 : 1;
    setIsChecked(newValue);
    storeData("isSubscribeToEmail", newValue);
  };

  return (
    <>
      <Alert className="bg-[#0e4028]"> 
        <AlertDescription>
          <div className="items-top flex space-x-2">
            <Checkbox 
              id="terms1" 
              checked={isChecked} 
              onCheckedChange={handleCheckboxChange} 
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Agree (optional)
              </label>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </>
  );
}

export default SubscribeToEmail;

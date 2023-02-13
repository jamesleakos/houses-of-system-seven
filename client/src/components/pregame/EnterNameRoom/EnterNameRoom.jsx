/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';

const EnterNameRoom = ({ setUsername }) => {
  const [name, setName] = useState('');

  const handleClick = function () {
    setUsername(name);
    setName('');
  };

  return (
    <div>
      <input
        type='text'
        placeholder='Your name'
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <input type='button' value='Submit' onClick={handleClick} />
    </div>
  );
};

export default EnterNameRoom;

import { useState,useEffect,useContext,useMemo } from "react";
import { ThemeContext } from "../context/ThemeContext";

import React from 'react'

const Filter = () => {
    const { theme } = useContext(ThemeContext);
  return (
    <div data-theme={theme} className="filter">
        <div className="flex justify-center items-center gap-4">
           <select name="" id="">
            <option value="">Action</option>
            <option value="">Adventure</option>
            <option value="">Comedy</option>
            <option value="">Drama</option>
            <option value="">Ecchi</option>
            <option value="">Fantasy</option>
            <option value="">Horror</option>
            <option value="">Mahou Shoujo</option>
            <option value="">Mecha</option>
            <option value="">Music</option>
            <option value="">Mystery</option>
            <option value="">Psychological</option>
            <option value="">Romance</option>
            <option value="">Sci-Fi</option>
            <option value="">Slice of Life</option>
            <option value="">Sports</option>
            <option value="">Supernatural</option>
            <option value="">Thriller</option>
           </select>
           <select name="" id="">
            <option value="">2025</option>
            <option value="">2024</option>
            <option value="">2023</option>
           </select>
           <select name="" id="">
            <option value="">TV</option>
            <option value="">Movie</option>
            <option value="">OVA</option>
            <option value="">ONA</option>
            <option value="">Special</option>
            <option value="">Music</option>
            <option value="">TV Short</option>
            <option value="">TV SPecial</option>
           </select>

        </div>
      
    </div>
  )
}

export default Filter


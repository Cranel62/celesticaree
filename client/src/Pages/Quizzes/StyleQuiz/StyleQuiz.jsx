import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './StyleQuiz.module.css';

const DEFAULT_POSITIONS = {
  fem: {
    tops: { top: 48, left: 10 },
    bottoms: { top: 120, left: 10 },
    dresses: { top: 50, left: 10 },
    shoes: { top: 560, left: 85 },
    accessories: { top: 150, left: 120 }
  },
  masc: {
    tops: { top: -25, left: 20 },
    bottoms: { top: 90, left: 18 },
    shoes: { top: 560, left: 85 },
    accessories: { top: 120, left: 110 }
  }
};

const LIMITS = { tops: 2, bottoms: 2, shoes: 1, accessories: 4, dresses: 1 };

export default function StyleQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userGender = user?.gender?.toLowerCase() === 'masculine' ? 'masc' : 'fem';
  const [currentGender, setCurrentGender] = useState(userGender);
  const [currentClothingSet, setCurrentClothingSet] = useState(userGender);
  const [openCategory, setOpenCategory] = useState('tops');
  const [droppedItems, setDroppedItems] = useState([]);
  
  // Interactive Removal & Dragging
  const [itemToRemove, setItemToRemove] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  // Audio Control
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const clothingSets = {
    fem: {
      tops: [
        { src: '/quizzes/assets/fem/bluetop1.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/businesstop1.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/basict.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/redelegant.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/creativepink.png', style: 'creative' },
        { src: '/quizzes/assets/fem/businesscasual.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/pinksoft.png', style: 'soft' },
        { src: '/quizzes/assets/fem/elegantwhite.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/businessblack.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/polo.png', style: 'rough' },
        { src: '/quizzes/assets/fem/brownelegant.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/whitesoft.png', style: 'soft' },
        { src: '/quizzes/assets/fem/blackpunk.png', style: 'rough' },
        { src: '/quizzes/assets/fem/blackcreative.png', style: 'creative' },
        { src: '/quizzes/assets/fem/blackgoth.png', style: 'soft' },
        { src: '/quizzes/assets/fem/blacksexy.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/creativepolo.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/cutet.png', style: 'rough' },
        { src: '/quizzes/assets/fem/blueelegant.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/creativesexy.png', style: 'soft' },
        { src: '/quizzes/assets/fem/greenelegant.png', style: 'elegant' }
      ],
      bottoms: [
        { src: '/quizzes/assets/fem/Untitled18_20251019095525.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_20251019095553.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/Untitled18_20251019095630.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102742.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102842.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102847.png', style: 'rough' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102851.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102901.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102907.png', style: 'rough' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102912.png', style: 'creative' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102916.png', style: 'creative' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102923.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102929.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102936.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102942.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102949.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_20251019102956.png', style: 'creative' },
        { src: '/quizzes/assets/fem/Untitled18_20251019103008.png', style: 'creative' },
        { src: '/quizzes/assets/fem/Untitled18_20251019103016.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_20251019103025.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_20251019103109.png', style: 'creative' }
      ],
      dresses: [
        { src: '/quizzes/assets/fem/Untitled18_20251019111152.png', style: 'rough' },
        { src: '/quizzes/assets/fem/Untitled18_20251019111202.png', style: 'rough' },
        { src: '/quizzes/assets/fem/Untitled18_20251019111209.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_20251019111214.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_20251019111218.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_20251019111226.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/Untitled18_20251019111232.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021163927.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/Untitled18_20251019115538.png', style: 'rough' },
        { src: '/quizzes/assets/fem/Untitled18_20251019115546.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/Untitled18_20251019115557.png', style: 'creative' },
        { src: '/quizzes/assets/fem/Untitled18_20251019115604.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/Untitled18_20251019115608.png', style: 'creative' },
        { src: '/quizzes/assets/fem/Untitled18_20251019115615.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152828.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152833.png', style: 'creative' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152838.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152843.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152849.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152853.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021160355.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152905.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152910.png', style: 'creative' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021160004.png', style: 'soft' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152922.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021152930.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021155001.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/Untitled18_Restored2_20251021163908.png', style: 'rough' }
      ],
      shoes: [
        { src: '/quizzes/assets/fem/etc/shoe.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/etc/shoe1.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/etc/shoe2.png', style: 'rough' },
        { src: '/quizzes/assets/fem/etc/shoe3.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/etc/shoe4.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/etc/shoe5.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/shoe6.png', style: 'rough' },
        { src: '/quizzes/assets/fem/etc/shoe7.png', style: 'soft' },
        { src: '/quizzes/assets/fem/etc/shoe8.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/etc/shoe9.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/shoe10.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/etc/shoe11.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/etc/shoe12.png', style: 'soft' },
        { src: '/quizzes/assets/fem/etc/shoe13.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/etc/shoe14.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/shoe15.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/etc/shoe16.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/etc/shoe17.png', style: 'rough' },
        { src: '/quizzes/assets/fem/etc/shoe18.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/etc/shoe19.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/etc/shoe20.png', style: 'minimalist' }
      ],
      accessories: [
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019104102.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019104120.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123320.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123402.png', style: 'rough' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123406.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123410.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123415.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123422.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123429.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123437.png', style: 'soft' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123443.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123517.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123527.png', style: 'businesswear' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123531.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123535.png', style: 'creative' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123543.png', style: 'minimalist' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123549.png', style: 'rough' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123555.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123606.png', style: 'elegant' },
        { src: '/quizzes/assets/fem/etc/Untitled16_20251019123633.png', style: 'rough' }
      ]
    },
    masc: {
      tops: [
        { src: '/quizzes/assets/masc/Untitled23_20251020113051.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled23_20251020113059.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled23_20251020113104.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled23_20251020122915.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123032.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123044.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123059.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123111.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123123.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123134.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123139.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123145.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123150.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123157.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123202.png', style: 'soft' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123207.png', style: 'soft' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123214.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123230.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123237.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123242.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123248.png', style: 'soft' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123254.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123306.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123311.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123316.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123321.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123328.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123338.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123345.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled23_20251020123350.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled23_20251020124834.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled23_20251020125036.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled23_20251020125044.png', style: 'creative' }
      ],
      bottoms: [
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145604.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145559.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145554.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145549.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145544.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145535.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145529.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145523.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145518.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145514.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145509.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145503.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145459.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145455.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145450.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145445.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145436.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145431.png', style: 'rough' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145426.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145422.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145418.png', style: 'creative' },
        { src: '/quizzes/assets/masc/Untitled18_Restored_20251020145414.png', style: 'minimalist' }
      ],
      shoes: [
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195815.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195810.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195807.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195803.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195759.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195755.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195751.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195746.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195742.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195737.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195733.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195728.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195723.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195720.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195715.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195709.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195705.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195700.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195657.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195653.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195648.png', style: 'creative' }
      ],
      accessories: [
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195603.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195559.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195552.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195543.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195537.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195533.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195526.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195522.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195518.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195513.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195509.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195502.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195456.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195451.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195448.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195444.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195440.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195435.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195430.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195425.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195420.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195416.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195411.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195259.png', style: 'elegant' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195253.png', style: 'minimalist' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195248.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195240.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195235.png', style: 'businesswear' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195231.png', style: 'creative' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195222.png', style: 'rough' },
        { src: '/quizzes/assets/masc/etc/Untitled19_20251020195215.png', style: 'minimalist' }
      ]
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      audioRef.current.play().catch(() => setIsMuted(true));
    }
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const addItemToCanvas = (src, style, category) => {
    const count = droppedItems.filter(i => i.category === category).length;
    if (count >= LIMITS[category]) {
      alert(`You can only add ${LIMITS[category]} ${category}`);
      return;
    }

    const pos = DEFAULT_POSITIONS[currentGender]?.[category] || { top: 100, left: 50 };
    setDroppedItems(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        src,
        style,
        category,
        left: pos.left,
        top: pos.top
      }
    ]);
  };

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    setActiveDragId(id);
    const item = droppedItems.find(i => i.id === id);
    dragOffsetRef.current = {
      x: e.clientX - item.left,
      y: e.clientY - item.top
    };
  };

  const handleTouchStart = (e, item) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setItemToRemove(item);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    setActiveDragId(item.id);
    const touch = e.touches[0];
    dragOffsetRef.current = {
      x: touch.clientX - item.left,
      y: touch.clientY - item.top
    };
  };

  const handleMouseMove = (e) => {
    if (!activeDragId) return;
    setDroppedItems(prev =>
      prev.map(item =>
        item.id === activeDragId
          ? {
              ...item,
              left: e.clientX - dragOffsetRef.current.x,
              top: e.clientY - dragOffsetRef.current.y
            }
          : item
      )
    );
  };

  const handleTouchMove = (e) => {
    if (!activeDragId) return;
    const touch = e.touches[0];
    setDroppedItems(prev =>
      prev.map(item =>
        item.id === activeDragId
          ? {
              ...item,
              left: touch.clientX - dragOffsetRef.current.x,
              top: touch.clientY - dragOffsetRef.current.y
            }
          : item
      )
    );
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      setDroppedItems(prev => prev.filter(i => i.id !== itemToRemove.id));
      setItemToRemove(null);
    }
  };

  // Dispatch payload to save_outfit.php
// Dispatch payload to backend
  const handleFinish = async () => {
    if (!droppedItems.length) {
      alert("Try dressing your mannequin first!");
      return;
    }

    setIsSubmitting(true);

    const styleCounter = {};
    droppedItems.forEach(i => {
      styleCounter[i.style] = (styleCounter[i.style] || 0) + 1;
    });
    const topStyle = Object.entries(styleCounter).sort((a, b) => b[1] - a[1])[0]?.[0] || 'minimalist';

    // Format matching backend expectations
    const outfitPayload = droppedItems.map(i => ({
      src: i.src,
      style: i.style,
      category: i.category,
      position: { left: `${i.left}px`, top: `${i.top}px` }
    }));

    // Cache locally for immediate display
    sessionStorage.setItem('temp_outfit', JSON.stringify(outfitPayload));
    sessionStorage.setItem('temp_style_result', topStyle);
    sessionStorage.setItem('temp_gender', currentGender);

    const currentUserId = user?.id || user?.sql_id || sessionStorage.getItem('user_id');

    try {
      // Direct call to port 5000 Express backend with /api fallback
      const apiUrl = window.location.port === '5173' 
        ? 'http://localhost:5000/api/save_outfit.php' 
        : '/api/save_outfit.php';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: currentUserId,
          outfit_data: outfitPayload,
          gender: currentGender,
          clothing_style: topStyle
        })
      });

      if (response.ok) {
        const resData = await response.json();
        if (!resData.success) {
          console.warn("Backend save issue:", resData.message || resData.error);
        }
      } else {
        console.warn("Backend returned status:", response.status);
      }
    } catch (err) {
      console.error("Network save error:", err);
    } finally {
      setIsSubmitting(false);
      navigate(`/quizzes/style-result?style=${encodeURIComponent(topStyle)}`);
    }
  };

  return (
    <div
      className={styles.pageWrapper}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      <audio ref={audioRef} autoPlay loop>
        <source src="/music/Clear_view.mp3" type="audio/mpeg" />
      </audio>

      <div className={`${styles.musicControl} ${isMuted ? styles.muted : ''}`} onClick={toggleMusic}>
        {isMuted ? '🔇' : '🔈'}
      </div>

      <div className={`${styles.bgAccent} ${styles.bgOne}`} />
      <div className={`${styles.bgAccent} ${styles.bgTwo}`} />

      <div className={styles.containerStylequiz}>
        <h1 className={styles.title}>Dress Your Model</h1>

        <div className={styles.quizLayout}>
          <div className={styles.canvasSection}>
            <button
              className={styles.toggleBtn}
              onClick={() => setCurrentGender(currentGender === 'fem' ? 'masc' : 'fem')}
            >
              Switch to {currentGender === 'fem' ? 'Masculine' : 'Feminine'}
            </button>

            <div className={styles.canvas}>
              <img
                className={styles.mannequin}
                src={
                  currentGender === 'fem'
                    ? '/quizzes/assets/fem_mannequin.png'
                    : '/quizzes/assets/Untitled24_20251020142151.png'
                }
                alt="Mannequin"
              />
              {droppedItems.map(item => (
                <img
                  key={item.id}
                  src={item.src}
                  className={styles.droppedItem}
                  style={{
                    left: `${item.left}px`,
                    top: `${item.top}px`,
                    zIndex: activeDragId === item.id ? 1000 : 10
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  onTouchStart={(e) => handleTouchStart(e, item)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setItemToRemove(item);
                  }}
                  alt={item.style}
                />
              ))}
            </div>

            <button className={styles.resetBtn} onClick={() => setDroppedItems([])}>
              Reset
            </button>
          </div>

          <div className={styles.clothingSection}>
            <button
              className={styles.toggleBtn}
              style={{ alignSelf: 'flex-start', marginBottom: 15 }}
              onClick={() => setCurrentClothingSet(currentClothingSet === 'fem' ? 'masc' : 'fem')}
            >
              Show {currentClothingSet === 'fem' ? 'Masculine' : 'Feminine'} Clothes
            </button>

            <div className={styles.clothingContainer}>
              <h2>Choose Your Pieces</h2>

              {['tops', 'bottoms', ...(currentClothingSet === 'fem' ? ['dresses'] : []), 'shoes', 'accessories'].map(cat => (
                <div key={cat} className={styles.category}>
                  <h3 onClick={() => setOpenCategory(openCategory === cat ? '' : cat)}>
                    <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                    <span className={`${styles.arrow} ${openCategory === cat ? styles.arrowOpen : ''}`}>
                      ▶
                    </span>
                  </h3>
                  <div className={`${styles.categoryContent} ${openCategory === cat ? styles.open : ''}`}>
                    {clothingSets[currentClothingSet][cat]?.map((item, idx) => (
                      <div
                        key={idx}
                        className={styles.item}
                        onClick={() => addItemToCanvas(item.src, item.style, cat)}
                      >
                        <img src={item.src} alt={item.style} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className={styles.finishBtn} onClick={handleFinish} disabled={isSubmitting}>
          {isSubmitting ? 'Saving Look...' : 'See My Style'}
        </button>
      </div>

      {itemToRemove && (
        <div className={styles.customModal}>
          <div className={styles.customModalContent}>
            <div className={styles.customModalHeader}>
              <h3>Remove Item</h3>
            </div>
            <div className={styles.customModalBody}>
              <p>Are you sure you want to remove this item from your outfit?</p>
            </div>
            <div className={styles.customModalFooter}>
              <button className={styles.btnCancel} onClick={() => setItemToRemove(null)}>
                Cancel
              </button>
              <button className={styles.btnConfirm} onClick={confirmRemoveItem}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
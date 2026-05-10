import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'mramer-motion'; // Wait, let's fix the import to 'framer-motion'
import { 
  Check, Loader2, Sparkles, AlertCircle, TrendingUp, Compass, 
  ShieldCheck, Receipt, ShoppingBag, Motorbike, Navigation, 
  ArrowRight, Home, Heart, RefreshCw, Star, Info, MapPin
} from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { useCartStore } from '../../store/cartStore';
import { toast } from 'sonner';
import DishImage from '../common/DishImage';

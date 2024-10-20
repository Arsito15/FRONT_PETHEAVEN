import AboutUs from "./AboutUs";
import Booking from "./BookingPage";
import Team from "./TeamPage";
import Testimonial from "./TestimonialPage";
import Contact from "./ContactPage";
import PageNotFound from "./PageNotFound";
import Room from "./RoomPage";
import Services from "./ServicesPage";
import Home from "../components/home/Home";
import ReservasActivas from "../pages/reservasactivas";
import UserForm from '../pages/UserForm';
import MascotaForm from "../pages/MascotaForm";  
import { CartProvider, useCart } from "../pages/CartContext"; // Importamos el contexto del carrito correctamente
import Cart from "../pages/Cart";  

export {
  Home,
  Booking,
  Testimonial,
  Team,
  AboutUs,
  Contact,
  PageNotFound,
  Room,
  Services,
  ReservasActivas,
  UserForm,
  MascotaForm,
  CartProvider,
  useCart,
  Cart,
};

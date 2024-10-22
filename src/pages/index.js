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

// Importamos las nuevas páginas para el administrador
import G_habitacion from "../pages/G_habitacion";
import G_productos from "../pages/G_productos";
import G_servicio from "../pages/G_servicio";
import G_usuario from "../pages/G_usuario";
import Graficas from "../pages/graficas";

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
  // Exportamos las páginas de administración
  G_habitacion,
  G_productos,
  G_servicio,
  G_usuario,
  Graficas,
};

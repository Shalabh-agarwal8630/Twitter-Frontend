import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter ,Quicksand} from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const inter = Inter({ subsets: ["latin"] });
const quicksand=Quicksand({subsets:["latin"]})

const queryClient =new QueryClient(); 
export default function App({ Component, pageProps }: AppProps) {
  return <div className={inter.className}>
    <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId="769228505313-0pi14omkth487trc5t966j7b8infr66f.apps.googleusercontent.com">
    <Component {...pageProps} />
       <Toaster/> 
       <ReactQueryDevtools/>
    </GoogleOAuthProvider>
    </QueryClientProvider>
    
  </div>;
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Converter from './Route/Converter'
import { ThemeProvider } from './context/ThemeProvider'

const queryClient = new QueryClient()
function App() {

   return (
      <ThemeProvider>
         <QueryClientProvider client={queryClient}>
            <Converter />
         </QueryClientProvider>
      </ThemeProvider>
   )
}

export default App

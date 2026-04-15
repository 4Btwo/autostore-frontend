import React from 'react';
import { 
  ShoppingCart, 
  Settings2, 
  Speaker, 
  CarFront, 
  CircleDashed,
  ChevronRight,
  Home,
  LayoutGrid,
  ClipboardList,
  Store
} from 'lucide-react';

export default function App() {
  return (
    // Container principal com a cor de fundo escura da imagem
    <div className="min-h-screen bg-[#070b14] text-white font-sans pb-20 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="flex justify-between items-center p-5 pt-8">
        <div className="flex items-center gap-2">
          {/* Logo simulado */}
          <div className="text-[#3b82f6] font-extrabold text-3xl italic tracking-tighter">A</div>
          <span className="font-bold text-xl tracking-wide">AutoStore</span>
        </div>
        <div className="relative cursor-pointer">
          <div className="bg-[#1a233a] p-2 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-gray-300" />
          </div>
          <span className="absolute -top-1 -right-1 bg-[#2563eb] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative mx-4 mt-2 mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-[#121b2f] to-[#0a101d] border border-gray-800/50">
        {/* Imagem de fundo simulando o farol do carro */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-lighten" 
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'right center'
          }} 
        />
        
        <div className="relative z-10 p-6 w-[85%]">
          <h1 className="text-2xl font-semibold leading-snug mb-3 text-gray-100">
            Peças e acessórios automotivos de qualidade
          </h1>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            Encontre tudo o que seu carro precisa em lojas confiáveis
          </p>
          <button className="bg-[#2563eb] hover:bg-blue-600 transition-colors text-white text-sm px-6 py-2.5 rounded-lg font-medium">
            Explorar Produtos
          </button>
        </div>
      </section>

      {/* CATEGORIAS (Scroll Horizontal) */}
      <section className="mb-8">
        <div className="flex gap-6 overflow-x-auto px-4 pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          
          <CategoryItem icon={<Settings2 />} label="Suspensão" active />
          <CategoryItem icon={<Speaker />} label="Som Automotivo" />
          <CategoryItem icon={<CarFront />} label="Interior" />
          <CategoryItem icon={<CircleDashed />} label="Roda e Pneu" />
          
        </div>
      </section>

      {/* LOJAS EM DESTAQUE */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 px-4 text-gray-200">Lojas em Destaque</h2>
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          
          {/* Card Loja 1 */}
          <StoreCard 
            logo="A" 
            name="Auto Center Turbo"
            imgUrl="https://images.unsplash.com/photo-1486262715619-679df11f6966?q=80&w=500&auto=format&fit=crop"
          />
          
          {/* Card Loja 2 */}
          <StoreCard 
            logo="O" 
            name="Oficina do Som"
            imgUrl="https://images.unsplash.com/photo-1511365181673-9831969a19c5?q=80&w=500&auto=format&fit=crop" // Simulação de rádio/som
          />

        </div>
      </section>

      {/* PRODUTOS POPULARES */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Produtos Populares</h2>
        <div className="grid grid-cols-3 gap-3">
            {/* Imagens de placeholder para os produtos */}
            <div className="bg-[#12192b] h-24 rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1486262715619-679df11f6966?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Freio" />
            </div>
            <div className="bg-[#12192b] h-24 rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Acessório" />
            </div>
            <div className="bg-[#12192b] h-24 rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600705722908-bab1e6191a03?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Roda" />
            </div>
        </div>
      </section>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 w-full bg-[#070b14]/95 backdrop-blur-md border-t border-gray-800/60 flex justify-around py-3 px-2 z-50">
        <NavItem icon={<Home className="w-6 h-6" />} label="Home" active />
        <NavItem icon={<LayoutGrid className="w-6 h-6" />} label="Categorias" />
        <NavItem icon={<ClipboardList className="w-6 h-6" />} label="Pedidos" />
        <NavItem icon={<Store className="w-6 h-6" />} label="Minha Loja" />
      </nav>

    </div>
  );
}

// --- Componentes Auxiliares para manter o código limpo ---

function CategoryItem({ icon, label, active }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
        active 
        ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] shadow-[0_0_15px_rgba(59,130,246,0.15)] border border-gray-700' 
        : 'bg-[#0f1523] group-hover:bg-[#1a233a]'
      }`}>
        <div className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
          {icon}
        </div>
      </div>
      <span className={`text-[11px] whitespace-nowrap ${active ? 'text-white font-medium' : 'text-gray-500 group-hover:text-gray-300'}`}>
        {label}
      </span>
      {active && <div className="w-6 h-0.5 bg-blue-500 rounded-full mt-1"></div>}
    </div>
  );
}

function StoreCard({ logo, name, imgUrl }) {
  return (
    <div className="bg-[#101726] border border-gray-800/60 rounded-2xl p-4 min-w-[260px] flex-shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-[#2563eb] rounded flex items-center justify-center text-xs font-bold text-white">
          {logo}
        </div>
        <span className="font-medium text-sm text-gray-200">{name}</span>
      </div>
      
      <div className="h-32 w-full rounded-xl mb-4 overflow-hidden bg-black relative">
        {/* Efeito de iluminação suave sobre a imagem da loja */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img src={imgUrl} alt={name} className="w-full h-full object-cover opacity-90" />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">{name}</span>
        <button className="bg-[#1e40af] hover:bg-[#2563eb] transition-colors text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium">
          Ver Loja <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div className="flex flex-col items-center cursor-pointer">
      <div className={`${active ? 'text-[#3b82f6]' : 'text-gray-500'}`}>
        {icon}
      </div>
      <span className={`text-[10px] mt-1 font-medium ${active ? 'text-[#3b82f6]' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

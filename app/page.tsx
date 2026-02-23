'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            SaaS Minimal
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cadastro
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Comece seu negócio online
              <span className="text-blue-600 dark:text-blue-400"> hoje mesmo</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              SaaS Minimal é um código open source pronto para usar.
              Perfeito para jovens empreendedores que querem colocar suas ideias em prática sem complicações.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <Link
                  href="/auth/sign-up"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Começar Agora →
                </Link>
                <Link
                  href="https://github.com"
                  target="_blank"
                  className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  Ver no GitHub
                </Link>
              </>
            )}
          </div>

          {/* Badge */}
          <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
            ⭐ Open Source • Gratuito • Fácil de usar
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            O que você recebe
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-lg/20 transition-shadow">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Pronto para Produção
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Código profissional, escalável e bem estruturado. Já testado e pronto para colocar no ar.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-lg/20 transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Onboarding Completo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fluxo de registro e configuração profissional. Guia seus usuários passo a passo.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-lg/20 transition-shadow">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Sistema de Planos
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Free, Pro e Enterprise. Monetize seu produto com facilidade.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-lg/20 transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Multi-tenant
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Suporte para múltiplas organizações. Escale seu negócio naturalmente.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-lg/20 transition-shadow">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Segurança
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Autenticação segura, RBAC, Row Level Security. Sua dados estão protegidos.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-lg/20 transition-shadow">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Responsivo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Design mobile-first. Funciona perfeitamente em qualquer dispositivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Construído com as melhores tecnologias
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Next.js 15', desc: 'Framework React moderno' },
              { name: 'TypeScript', desc: 'Type-safe development' },
              { name: 'Supabase', desc: 'Backend como serviço' },
              { name: 'Tailwind CSS', desc: 'Styling moderno' },
              { name: 'React Hooks', desc: 'Estado e lógica' },
              { name: 'POO & Design Patterns', desc: 'Arquitetura robusta' },
              { name: 'RBAC', desc: 'Controle de acesso' },
              { name: 'Dark Mode', desc: 'Interface amigável' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {tech.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Clone o Repositório',
                desc: 'Faça um fork e comece a trabalhar imediatamente',
              },
              {
                step: '2',
                title: 'Configure',
                desc: 'Configure variáveis de ambiente e banco de dados',
              },
              {
                step: '3',
                title: 'Desenvolva',
                desc: 'Customize e adicione suas funcionalidades',
              },
              {
                step: '4',
                title: 'Publique',
                desc: 'Deploy em produção e comece a ganhar dinheiro',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-600 text-white rounded-full text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-blue-600 dark:bg-blue-900 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100">
            Sua ideia merece ser colocada no ar. Comece agora mesmo com SaaS Minimal.
          </p>
          {!isAuthenticated && (
            <Link
              href="/auth/sign-up"
              className="inline-block bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Criar Conta Agora →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Produto
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Comunidade
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    Issues
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Legal
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    Licença MIT
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-white">
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>
              © 2024 SaaS Minimal. Open Source • Feito para empreendedores • MIT License
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

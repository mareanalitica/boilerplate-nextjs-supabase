/**
 * GET /api/organizations
 * Retorna as organizações do usuário autenticado
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    // Criar cliente Supabase no servidor
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Pode falhar no servidor
            }
          },
        },
      }
    )

    // Obter usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar organizações owned by user
    const { data: ownedOrgs, error: ownedError } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)

    if (ownedError) {
      console.error('Error fetching owned organizations:', ownedError)
      return Response.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      )
    }

    // Buscar organizações where user is member
    const { data: memberOrgs, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)

    if (memberError) {
      console.error('Error fetching member organizations:', memberError)
      return Response.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      )
    }

    const memberOrgIds = memberOrgs?.map((m: any) => m.organization_id) || []

    // Se há organizações de membro, buscar seus detalhes
    let memberOrgDetails: any[] = []
    if (memberOrgIds.length > 0) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .in('id', memberOrgIds)

      if (error) {
        console.error('Error fetching member org details:', error)
      } else {
        memberOrgDetails = data || []
      }
    }

    // Combinar e remover duplicatas
    const allOrgs = [...(ownedOrgs || []), ...memberOrgDetails]
    const uniqueOrgs = Array.from(
      new Map(allOrgs.map((org: any) => [org.id, org])).values()
    )

    return Response.json({ organizations: uniqueOrgs })
  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

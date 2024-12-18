import { useQuery } from '@tanstack/react-query'
import * as directus from '../lib/directus'

export const useDestinationsList = (type: string, languageCode: string) => {
    return useQuery({
        queryKey: ['destinations', type, languageCode],
        queryFn: () => directus.getDestinationsByType(type, languageCode),
    })
}

export const useDestination = (slug: string, languageCode: string) => {
    return useQuery({
        queryKey: ['destination', slug, languageCode],
        queryFn: () => directus.getDestinationBySlug(slug, languageCode),
        enabled: !!slug && !!languageCode,
    })
}
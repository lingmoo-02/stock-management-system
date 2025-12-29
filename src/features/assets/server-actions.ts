'use server'

import { getAllAssets, getUniqueCategoriesAction } from './services/assetService'

export async function getAllAssetsAction() {
  try {
    const assets = await getAllAssets()
    return assets
  } catch (error) {
    console.error('[getAllAssetsAction] Error:', error)
    throw error
  }
}

export async function getUniqueCategoriesServerAction() {
  try {
    const categories = await getUniqueCategoriesAction()
    return categories
  } catch (error) {
    console.error('[getUniqueCategoriesServerAction] Error:', error)
    throw error
  }
}

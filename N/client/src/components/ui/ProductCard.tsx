import React from 'react'

export interface Product {
  id: string | number
  name: string
  price: number
  originalPrice?: number
  image?: string
  rating?: number
  reviewCount?: number
  badge?: string
  category?: string
  inStock?: boolean
  discount?: number
  description?: string
}

export interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onViewDetails?: (product: Product) => void
  onWishlist?: (product: Product) => void
  isWishlisted?: boolean
  className?: string
  showActions?: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  onWishlist,
  isWishlisted = false,
  className = '',
  showActions = true,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${product.id}-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#FCD34D" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${product.id}-${i})`} d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
            <path fill="currentColor" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )
      }
    }
    return stars
  }

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md
        transition-all duration-200 overflow-hidden group
        ${className}
      `}
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500 text-white">
            {product.badge}
          </span>
        )}

        {product.discount && product.discount > 0 && !product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg bg-green-500 text-white">
            -{product.discount}%
          </span>
        )}

        {showActions && (
          <button
            onClick={() => onWishlist?.(product)}
            className={`
              absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm
              shadow-sm hover:shadow-md transition-all duration-200
              ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
            `}
          >
            <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {product.inStock === false && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {product.category && (
          <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wide">{product.category}</p>
        )}
        <h3
          className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onViewDetails?.(product)}
        >
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center gap-1 mb-2">
          {product.rating !== undefined && renderStars(product.rating)}
          {product.reviewCount !== undefined && (
            <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>

        {showActions && product.inStock !== false && (
          <button
            onClick={() => onAddToCart?.(product)}
            className="mt-3 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Add to Cart
          </button>
        )}

        {showActions && (
          <button
            onClick={() => onViewDetails?.(product)}
            className="mt-2 w-full py-2 px-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 text-sm font-medium rounded-lg transition-colors duration-200"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductCard

using CatalogService.Models;

namespace CatalogService.Services
{
    public interface ICatalogService
    {
        Task<IEnumerable<Category>> GetCategoriesWithProductsAsync();
    }
}

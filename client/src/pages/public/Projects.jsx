import { useState, useCallback } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { useSyncRefetch } from '../../utils/sync';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useSyncRefetch(fetchProjects, 'projects_updated');

  return (
    <div className="min-h-screen bg-primary py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main mb-3 tracking-tight">
            Featured Projects
          </h1>
          <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full mb-4"></div>
          <p className="text-base text-text-muted max-w-xl mx-auto leading-relaxed">
            Explore our portfolio of successfully delivered industrial and commercial fabrication projects across the region.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-accent"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border-main p-8">
            <p className="text-text-muted">No projects featured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            {projects.map((project) => (
              <div
                key={project._id}
                className="card-premium card-premium-hover flex flex-col md:flex-row group overflow-hidden"
              >
                <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden bg-secondary">
                  {project.images && project.images.length > 0 ? (
                    <img
                      src={getOptimizedImageUrl(project.images[0].secure_url, 600)}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                      No Image Available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                </div>
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between md:w-3/5">
                  <div>
                    <div className="flex items-center gap-1.5 text-brand-accent mb-3 text-xs font-semibold">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{project.location}</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main mb-3 leading-snug group-hover:text-brand-accent transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-text-muted text-xs leading-relaxed mb-6 line-clamp-4">
                      {project.description}
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-accent hover:text-brand-accent-hover font-bold transition-all duration-300 group/link mt-auto"
                  >
                    Discuss a similar project
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
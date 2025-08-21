{/* ✅ VUE LISTE IMPLÉMENTÉE - REMPLACE "Vue liste en cours de développement" */}
          {viewMode === 'list' && (
            <PremiumCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Titre</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Priorité</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Rôle</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Assigné à</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">XP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Créée le</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    <AnimatePresence>
                      {filteredTasks.map((task, index) => {
                        const statusInfo = TASK_STATUS[task.status] || TASK_STATUS.todo;
                        const priorityInfo = TASK_PRIORITY[task.priority] || TASK_PRIORITY.medium;
                        const isAssignedToMe = Array.isArray(task.assignedTo) 
                          ? task.assignedTo.includes(user?.uid)
                          : task.assignedTo === user?.uid;

                        return (
                          <motion.tr
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                          >
                            {/* Titre */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {task.hasImage && (
                                    <ImageIcon className="w-4 h-4 text-blue-400" />
                                  )}
                                  {task.hasComment && (
                                    <MessageCircle className="w-4 h-4 text-green-400" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium text-white truncate max-w-xs" title={task.title}>
                                    {task.title}
                                  </h3>
                                  {task.description && (
                                    <p className="text-sm text-gray-400 truncate max-w-xs" title={task.description}>
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Statut */}
                            <td className="py-3 px-4">
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${statusInfo.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                                ${statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                                ${statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                                ${statusInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
                                ${statusInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                                ${statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                              `}>
                                <span className="mr-1">{statusInfo.icon}</span>
                                {statusInfo.label}
                              </span>
                            </td>

                            {/* Priorité */}
                            <td className="py-3 px-4">
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${priorityInfo.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                                ${priorityInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${priorityInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                                ${priorityInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                <span className="mr-1">{priorityInfo.icon}</span>
                                {priorityInfo.label}
                              </span>
                            </td>

                            {/* Rôle */}
                            <td className="py-3 px-4">
                              {task.role || task.roleId ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                                  🎭 {task.role || task.roleId}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">-</span>
                              )}
                            </td>

                            {/* Assigné à */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {isAssignedToMe ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                    <User className="w-3 h-3 mr-1" />
                                    Moi
                                  </span>
                                ) : task.assignedTo && task.assignedTo.length > 0 ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                    <Users className="w-3 h-3 mr-1" />
                                    {Array.isArray(task.assignedTo) ? task.assignedTo.length : 1}
                                  </span>
                                ) : task.openToVolunteers ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                    <Heart className="w-3 h-3 mr-1" />
                                    Ouvert
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-sm">Non assignée</span>
                                )}
                              </div>
                            </td>

                            {/* XP */}
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                {task.xpReward || 25} XP
                              </span>
                            </td>

                            {/* Date de création */}
                            <td className="py-3 px-4">
                              <div className="flex items-center text-sm text-gray-400">
                                <Calendar className="w-4 h-4 mr-2" />
                                {convertFirebaseTimestamp(task.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewDetails(task)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Voir les détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                
                                {(isAssignedToMe || user?.isAdmin) && (
                                  <button
                                    onClick={() => handleEdit(task)}
                                    className="text-green-400 hover:text-green-300 transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                                
                                {user?.isAdmin && (
                                  <button
                                    onClick={() => handleDelete(task)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {/* Footer du tableau avec résumé */}
              <div className="px-4 py-3 bg-gray-700/30 border-t border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>
                    Affichage de {filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''}
                    {filteredTasks.length !== tasks.length && ` sur ${tasks.length} au total`}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span>
                      Total XP: {filteredTasks.reduce((sum, task) => sum + (task.xpReward || 25), 0)}
                    </span>
                    <span>
                      Mes tâches: {filteredTasks.filter(t => {
                        const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
                        return assignedTo.includes(user?.uid);
                      }).length}
                    </span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          )}

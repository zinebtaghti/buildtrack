import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Project } from '@/types';
import { Banknote, ArrowUpRight, ArrowDownRight, Plus, Download } from 'lucide-react-native';

interface ProjectBudgetProps {
  project: Project;
}

export function ProjectBudget({ project }: ProjectBudgetProps) {
  // Format budget
  const formattedBudget = project.budget.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Dummy budget data
  const budgetData = {
    totalBudget: project.budget,
    spent: project.budget * 0.65, // 65% spent
    remaining: project.budget * 0.35, // 35% remaining
    categories: [
      { name: 'Materials', percentage: 40, spent: project.budget * 0.4 * 0.7, allocated: project.budget * 0.4 },
      { name: 'Labor', percentage: 30, spent: project.budget * 0.3 * 0.8, allocated: project.budget * 0.3 },
      { name: 'Equipment', percentage: 15, spent: project.budget * 0.15 * 0.6, allocated: project.budget * 0.15 },
      { name: 'Permits', percentage: 5, spent: project.budget * 0.05 * 0.9, allocated: project.budget * 0.05 },
      { name: 'Contingency', percentage: 10, spent: project.budget * 0.1 * 0.1, allocated: project.budget * 0.1 }
    ],
    transactions: [
      { 
        id: '1', 
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
        description: 'Concrete materials payment', 
        amount: 28500, 
        type: 'expense',
        category: 'Materials'
      },
      { 
        id: '2', 
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 
        description: 'Labor costs for week 12', 
        amount: 42000, 
        type: 'expense',
        category: 'Labor'
      },
      { 
        id: '3', 
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), 
        description: 'Equipment rental', 
        amount: 18500, 
        type: 'expense',
        category: 'Equipment'
      },
      { 
        id: '4', 
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), 
        description: 'Client installment payment', 
        amount: 1500000, 
        type: 'income',
        category: 'Payment'
      },
      { 
        id: '5', 
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), 
        description: 'Building permits', 
        amount: 12800, 
        type: 'expense',
        category: 'Permits'
      }
    ]
  };
  
  // Calculate some additional stats
  const percentageSpent = Math.round((budgetData.spent / budgetData.totalBudget) * 100);
  const isOverBudget = budgetData.spent > budgetData.totalBudget;
  
  // Format currency function
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.budgetSummary}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Budget Overview</Text>
          <View style={styles.totalBudget}>
            <Banknote size={16} color="#0B5394" />
            <Text style={styles.totalBudgetText}>{formattedBudget}</Text>
          </View>
        </View>
        
        <View style={styles.budgetProgress}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressTitle}>Budget Utilization</Text>
            <Text style={[
              styles.progressPercentage,
              isOverBudget ? styles.textDanger : styles.textSuccess
            ]}>
              {percentageSpent}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(percentageSpent, 100)}%` },
                isOverBudget ? styles.progressDanger : 
                percentageSpent > 90 ? styles.progressWarning : 
                styles.progressSuccess
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.budgetStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>{formatCurrency(budgetData.spent)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[
              styles.statValue,
              isOverBudget ? styles.textDanger : styles.textSuccess
            ]}>
              {formatCurrency(budgetData.remaining)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.categoriesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Categories</Text>
          <TouchableOpacity style={styles.reportButton}>
            <Download size={16} color="#0B5394" />
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
        
        {budgetData.categories.map((category, index) => {
          const percentageUsed = Math.round((category.spent / category.allocated) * 100);
          const isOverCategory = category.spent > category.allocated;
          
          return (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
              </View>
              
              <View style={styles.categoryBar}>
                <View 
                  style={[
                    styles.categoryFill, 
                    { width: `${Math.min(percentageUsed, 100)}%` },
                    isOverCategory ? styles.categoryDanger : 
                    percentageUsed > 90 ? styles.categoryWarning : 
                    styles.categorySuccess
                  ]} 
                />
              </View>
              
              <View style={styles.categoryDetails}>
                <Text style={styles.categorySpent}>
                  {formatCurrency(category.spent)} spent
                </Text>
                <Text style={styles.categoryAllocated}>
                  {formatCurrency(category.allocated)} allocated
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      
      <View style={styles.transactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {budgetData.transactions.slice(0, 4).map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[
                styles.transactionIcon,
                transaction.type === 'income' ? styles.incomeIcon : styles.expenseIcon
              ]}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight size={16} color="#2E7D32" />
                ) : (
                  <ArrowDownRight size={16} color="#E53935" />
                )}
              </View>
              <View>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionMeta}>
                  {transaction.category} • {transaction.date.toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text style={[
              styles.transactionAmount,
              transaction.type === 'income' ? styles.textSuccess : styles.textNeutral
            ]}>
              {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
            </Text>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addTransactionButton}>
          <Plus size={16} color="#0B5394" />
          <Text style={styles.addTransactionText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  budgetSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#263238',
  },
  totalBudget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalBudgetText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#0B5394',
    marginLeft: 6,
  },
  budgetProgress: {
    marginBottom: 16,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#455A64',
  },
  progressPercentage: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ECEFF1',
    borderRadius: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressSuccess: {
    backgroundColor: '#2E7D32',
  },
  progressWarning: {
    backgroundColor: '#F57C00',
  },
  progressDanger: {
    backgroundColor: '#E53935',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ECEFF1',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#263238',
  },
  textSuccess: {
    color: '#2E7D32',
  },
  textWarning: {
    color: '#F57C00',
  },
  textDanger: {
    color: '#E53935',
  },
  textNeutral: {
    color: '#263238',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#263238',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reportButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#0B5394',
    marginLeft: 4,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#455A64',
  },
  categoryPercentage: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
  },
  categoryBar: {
    height: 8,
    backgroundColor: '#ECEFF1',
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryFill: {
    height: '100%',
    borderRadius: 4,
  },
  categorySuccess: {
    backgroundColor: '#4CAF50',
  },
  categoryWarning: {
    backgroundColor: '#FF9800',
  },
  categoryDanger: {
    backgroundColor: '#F44336',
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categorySpent: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#455A64',
  },
  categoryAllocated: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#607D8B',
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: '#E8F5E9',
  },
  expenseIcon: {
    backgroundColor: '#FFEBEE',
  },
  transactionDescription: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#263238',
    marginBottom: 2,
  },
  transactionMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#607D8B',
  },
  transactionAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  addTransactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  addTransactionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
    marginLeft: 8,
  },
});